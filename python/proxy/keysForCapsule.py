#1
# Sets a default curve (secp256k1)
import random, io, json, shelve, base64
from pprint import pprint
from umbral.config import default_curve
from umbral.params import UmbralParameters
from umbral import pre, keys, config, signing
from umbral.keys import UmbralPublicKey, UmbralPrivateKey
from PIL import Image

config.set_default_curve()

#2
# Generate an Umbral key pair
# ---------------------------
# First, Let's generate two asymmetric key pairs for Alice:
# A delegating key pair and a Signing key pair.

alices_private_key = None
shelf = shelve.open('mydata')

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
shelf = shelve.open('mydata')  # open for reading and writing, creating if nec
bob_capsule = capsule
capsule_bytes = bytes(bob_capsule)
ciphertext_bytes = bytes(ciphertext)
pprint(capsule_bytes)
bob_hex = bob_capsule.to_bytes().hex()
shelf["capsule"] = bob_hex
shelf["ciphertext"] = ciphertext_bytes
shelf["ciphertext_original"] = ciphertext
pprint(bob_capsule)

shelf.close()


pprint(bob_hex)
pprint("*******")
curve = default_curve()
params = UmbralParameters(curve=curve)
# pprint(pre.Capsule.from_bytes(capsule_bytes, params))
pprint("////////")
pprint(pre.Capsule.from_bytes(bytes.fromhex(bob_hex), params))
#4
# Decrypt data for Alice
# ----------------------
# Since data was encrypted with Alice's public key,
# Alice can open the capsule and decrypt the ciphertext with her private key.

cleartext = pre.decrypt(ciphertext=ciphertext,
                        capsule=capsule,
                        decrypting_key=alices_private_key)

image_cleartext = Image.open(io.BytesIO(cleartext))
image_cleartext.save("python/proxy/232.jpg")
# print(cleartext)

#5
# Bob Exists
# -----------

bobs_private_key = keys.UmbralPrivateKey.gen_key()
bobs_public_key = bobs_private_key.get_pubkey()

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

# Bob collects the resulting `cfrags` from several Ursulas. 
# Bob must gather at least `threshold` `cfrags` in order to activate the capsule.

shelf = shelve.open('mydata')  # open for reading and writing, creating if nec
bob_hex_capsule_from_file = shelf["capsule"]
capsule_from_file = pre.Capsule.from_bytes(bytes.fromhex(bob_hex_capsule_from_file), params)
ciphertext_hex = shelf["ciphertext"]
pprint(bob_capsule)
ciphertext_original = shelf["ciphertext_original"]
shelf.close()

capsule_from_file.set_correctness_keys(delegating=alices_public_key,
                                 receiving=bobs_public_key,
                                 verifying=alices_verifying_key)
                                 
reencrypt_hex_capsule = capsule_from_file.to_bytes().hex()
pprint("+++++++++")
pprint(reencrypt_hex_capsule)
# resieve capsule
reencrypt_capsule = pre.Capsule.from_bytes(bytes.fromhex(reencrypt_hex_capsule), params)                                 
cfrags = list()  # Bob's cfrag collection
for kfrag in kfrags:
    cfrag = pre.reencrypt(kfrag=kfrag, capsule=capsule_from_file)
    cfrags.append(cfrag)
assert len(cfrags) == 10

for cfrag in cfrags:
    capsule_from_file.attach_cfrag(cfrag)
# pprint(capsule_from_file)

cleartextDecrypted = pre.decrypt(ciphertext=ciphertext,
                        capsule=capsule_from_file,
                        decrypting_key=bobs_private_key)

image_cleartext = Image.open(io.BytesIO(cleartextDecrypted))
image_cleartext.save("python/proxy/233.jpg")
# print("kfrags:", f'{kfrags}')
# for line in sys.stdin:
# dict = [{'delegating': alices_public_key},{'receiving': bobs_public_key},{'verifying': alices_verifying_key}]
# pprint("===========")
# print(alices_public_key) # UmbralPublicKey:036e2d8feb51ad5
# print(type(alices_public_key)) # "<class 'umbral.keys.UmbralPublicKey'>"
# alic_pub_byte = bytes(alices_public_key)
# pprint(str(alic_pub_byte, 'utf-8' ))
# apb_64 = base64.b64encode(alic_pub_byte)
# k = "\x03\\:\xd1\x0e\x16\xa6\xab\xcaj\x91\xe0\x82h\xb1J\xd6\x01+\x98uz'S", '\xadj\x94\x06\x96\x9e\x8aJ*'

# b"\x03\\:\xd1\x0e\x16\xa6\xab\xcaj\x91\xe0\x82h\xb1J\xd6\x01+\x98uz'S"", " b'\xadj\x94\x06\x96\x9e\x8aJ*'
# renove_alice_key = base64.b64decode(apb_64)
# pprint(apb_64)
# pprint("===========renove_alice_key")
# pprint(renove_alice_key.decode("utf-8", errors="ignore"))
apk_hex = alices_public_key.to_bytes().hex()
bpk_hex = bobs_public_key.to_bytes().hex()
vpk_hex = alices_verifying_key.to_bytes().hex()
priv_hex = alices_private_key.to_bytes().hex()
# pprint(apk_hex)
# pprint("===========hex")
# text = str( apb_64, 'utf-8' )
# pprint("===========pb_64")
# pprint(text)
verifying_key_fromBytes = UmbralPublicKey.from_bytes(bytes.fromhex(apk_hex))
# print(verifying_key_fromBytes)
# pprint(priv_hex)
# pprint("?????")


# dict = [alices_public_key, bobs_public_key, alices_verifying_key]
# print  str (dict)
t = json.dumps({'delegating':apk_hex, "receiving":bpk_hex , "verifying":vpk_hex }) # '[1, 2, [3, 4]]'
pprint(t)

pprint("!!!!")
#return t
# pprint(str(dict))
# print(json.dumps(json.loads(text)) 
# pprint(r)
# pprint(json.dumps(json.loads(str({"('delegating',)": alices_public_key}))) 
# pprint(json.dumps(json.loads(str(bobs_public_key)))
# pprint(f'{"delegating": {alices_public_key}}')
# pprint(f'{"receiving": {bobs_public_key}}')
# pprint(f'{"verifying": {alices_verifying_key}}')
# pprint(f"capsule: bob_capsule")
shelf = shelve.open('mydata')  # open for reading and writing, creating if nec
#shelf.update({'delegating':apk_hex})
shelf["delegating"] = apk_hex
shelf["privKey"] = priv_hex
shelf.close()

shelf = shelve.open('mydata')

pprint(shelf["delegating"])
priv_key_fromBytesFile = UmbralPrivateKey.from_bytes(bytes.fromhex(shelf["privKey"]))
key_fromBytesFile = UmbralPublicKey.from_bytes(bytes.fromhex(shelf["delegating"]))
pprint(key_fromBytesFile)
pprint(priv_key_fromBytesFile)
shelf.close()


my_dict = {'delegating':apk_hex}

def dict_to_binary(the_dict):
    str = json.dumps(the_dict)
    binary = ' '.join(format(ord(letter), 'b') for letter in str)
    return binary


def binary_to_dict(the_binary):
    jsn = ''.join(chr(int(x, 2)) for x in the_binary.split())
    d = json.loads(jsn)  
    return d

# bin = dict_to_binary(alices_public_key)
# print(bin)

# dct = binary_to_dict(bin)
# print(dct)