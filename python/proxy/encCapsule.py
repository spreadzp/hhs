import random, io, json, shelve, base64
from pprint import pprint
# from umbral.config import default_curve
# from umbral.params import UmbralParameters
from umbral import pre, keys, config, signing, params
from umbral.config import default_params
from umbral.cfrags import CapsuleFrag
from umbral.kfrags import KFrag
from umbral.keys import UmbralPublicKey, UmbralPrivateKey
from PIL import Image 

config.set_default_curve()

#2
# Generate an Umbral key pair
# ---------------------------
# First, Let's generate two asymmetric key pairs for Alice:
# A delegating key pair and a Signing key pair.

alices_private_key = None
shelf = shelve.open('python/proxy/aliceKey')

if alices_private_key == None:
    alices_private_key = keys.UmbralPrivateKey.gen_key()
    priv_hex = alices_private_key.to_bytes().hex()
    shelf["privKey"] = priv_hex
alices_private_key = UmbralPrivateKey.from_bytes(bytes.fromhex(shelf["privKey"]))    
shelf.close()

# alices_private_key = keys.UmbralPrivateKey.gen_key()
alices_public_key = alices_private_key.get_pubkey()
alices_signing_key = keys.UmbralPrivateKey.gen_key()
alices_verifying_key = alices_signing_key.get_pubkey()
alices_signer = signing.Signer(private_key=alices_signing_key)
#3
# Encrypt some data for Alice
# ---------------------------
# Now let's encrypt data with Alice's public key.
# Invocation of `pre.encrypt` returns both the `ciphertext`,
# and a `capsule`. Anyone with Alice's public key can perform
# this operation.
with open("python/proxy/23.jpg", "rb") as imageFile:
  f = imageFile.read()
  plaintext = bytes(f) 

# plaintext = b'Proxy Re-encryption is cool!' 
# print(plaintext)
ciphertext, capsule = pre.encrypt(alices_public_key, plaintext) 
shelf = shelve.open('python/proxy/mydata')  # open for reading and writing, creating if nec
bob_capsule = capsule 
shelf["ciphertext_original"] = ciphertext
ciphertext_from_file = shelf["ciphertext_original"] 
cleartext = pre.decrypt(ciphertext=ciphertext_from_file,
                        capsule=capsule,
                        decrypting_key=alices_private_key)
shelf["cleartext"] = cleartext
image_cleartext = Image.open(io.BytesIO(cleartext))
image_cleartext.save("python/proxy/333.jpg")
shelf.close()

 

#curve = config.default_curve()
#params = params.UmbralParameters(curve=curve)
##5
# Bob Exists
# -----------

from doctorPublicKey import get_doctor_private_key, get_doctor_public_key  
bobs_private_key = get_doctor_private_key()
bobs_public_key = get_doctor_public_key() 
#6
# Bob receives a capsule through a side channel (s3, ipfs, Google cloud, etc)


 
#8
# Alice grants access to Bob by generating kfrags 
# -----------------------------------------------
# When Alice wants to grant Bob access to open her encrypted messages, 
# she creates *threshold split re-encryption keys*, or *"kfrags"*, 
# which are next sent to N proxies or *Ursulas*. 
# She uses her private key, and Bob's public key, and she sets a minimum 
# threshold of 10, for 20 total shares

kfrags = pre.generate_kfrags(delegating_privkey=alices_private_key,
                             signer=alices_signer,
                             receiving_pubkey=bobs_public_key,
                             threshold=10,
                             N=20)
# pprint("kfrags=====================")
# pprint(kfrags)
#9
# Ursulas perform re-encryption
# ------------------------------
# Bob asks several Ursulas to re-encrypt the capsule so he can open it. 
# Each Ursula performs re-encryption on the capsule using the `kfrag` 
# provided by Alice, obtaining this way a "capsule fragment", or `cfrag`.
# Let's mock a network or transport layer by sampling `threshold` random `kfrags`,
# one for each required Ursula.


import random

kfrags = random.sample(kfrags,  # All kfrags from above
                       10)      # M - Threshold
kfrags_hex = list()
for kfrag_hex in kfrags:
    kfrag_hex = kfrag_hex.to_bytes().hex()
    kfrags_hex.append(kfrag_hex)                       
# print("************************** random `kfrags_hex`") 
# print(kfrags_hex) 
# Bob collects the resulting `cfrags` from several Ursulas. 
# Bob must gather at least `threshold` `cfrags` in order to activate the capsule. 
 
 
bob_capsule.set_correctness_keys(delegating=alices_public_key,
                                 receiving=bobs_public_key,
                                 verifying=alices_verifying_key)

cfrags = list()  # Bob's cfrag collection
cfrags_hex = list()
for kfrag_h in kfrags_hex:
    kfrag_from_hex = KFrag.from_bytes(bytes.fromhex(kfrag_h))
    cfrag = pre.reencrypt(kfrag=kfrag_from_hex, capsule=bob_capsule)
    cfrag_hex = cfrag.to_bytes().hex()
    cfrags_hex.append(cfrag_hex)
    cfrags.append(cfrag)  # Bob collects a cfrag

assert len(cfrags) == 10 
# pprint("$$$$$$$$$$cfrags --------------------")
##pprint(cfrags_hex_from_file)
# receive from server

for cfrag in cfrags:
    # cfrags_from_hex = CapsuleFrag.from_bytes(bytes.fromhex(cfrag_hex_from_file))
    ##pprint(cfrags_from_hex)
    bob_capsule.attach_cfrag(cfrag)
#for cfrag in cfrags:
#    capsule_from_file.attach_cfrag(cfrag)
# Bob collects the resulting `cfrags` from several Ursulas. 
# Bob must gather at least `threshold` `cfrags` in order to activate the capsule.

  # open for reading and writing, creating if nec
 


apk_hex = alices_public_key.to_bytes().hex()
bpk_hex = bobs_public_key.to_bytes().hex()
vpk_hex = alices_verifying_key.to_bytes().hex()
#pprint(bob_capsule)
#pprint("))))))))))))))))capsule_from_file")
capsule_from_file_bytes= bob_capsule.to_bytes()
capsule_from_file_hex = bob_capsule.to_bytes().hex()
t = json.dumps({'delegating':apk_hex, 'receiving':bpk_hex , 'verifying':vpk_hex, 'capsule':capsule_from_file_hex })

curve = config.default_curve()
params = params.UmbralParameters(curve=curve)
# params = default_params()
#params = pre.Capsule.params
#params = pre.Capsule.params
capsule_from_server = pre.Capsule.from_bytes( bytes.fromhex(capsule_from_file_hex),  params=params )
#assert capsule_from_server == bob_capsule
bob_cleartext = pre.decrypt(ciphertext=ciphertext_from_file, capsule=capsule_from_server, decrypting_key=bobs_private_key)

## print("bob_cleartext")
## print(bob_cleartext)
image = Image.open(io.BytesIO(bob_cleartext))
image.save("python/proxy/35.jpg") 
pprint(t)
#ciphertext_bytes

#bob_cleartext = pre.decrypt(ciphertext=cleartext_from_file, capsule=capsule_from_file, decrypting_key=bobs_private_key)
# print("bob_cleartext")
# print(bob_cleartext)
#image = Image.open(io.BytesIO(bob_cleartext))
#image.save("python/proxy/25.jpg")
#assert bob_cleartext == plaintext

#bob_cleartext2 = pre.decrypt(ciphertext=cleartext_from_file, capsule=capsule_from_file, decrypting_key=bobs_private_key)
## print("bob_cleartext")
## print(bob_cleartext)
#image2 = Image.open(io.BytesIO(bob_cleartext2))
#image2.save("python/proxy/251.jpg")