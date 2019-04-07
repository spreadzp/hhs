import random, io
from pprint import pprint
from umbral import pre, keys, config, signing
from PIL import Image

config.set_default_curve()

#2
# Generate an Umbral key pair
# --------------------------- 
# A delegating key pair and a Signing key pair. 
def get_signer_keys ():
    alices_private_key = keys.UmbralPrivateKey.gen_key()
    alices_public_key = alices_private_key.get_pubkey()
    alices_signing_key = keys.UmbralPrivateKey.gen_key()
    alices_verifying_key = alices_signing_key.get_pubkey()
    alices_signer = signing.Signer(private_key=alices_signing_key)
    newkeys = {"privateSigningKey": alices_signing_key, "publicSigningKey": alices_verifying_key, "signer": alices_signer}
    # print (newkeys) 
    with open("python/proxy/23.jpg", "rb") as imageFile:
        f = imageFile.read()
        plaintext = bytes(f)
    # print("imgStart")
    # print(b)
    # print("imgEnd")

    # plaintext = b'Proxy Re-encryption is cool!'
    # print("@@@@")
    # print(plaintext)
    ciphertext, capsule = pre.encrypt(alices_public_key, plaintext)
    # print(ciphertext)
    print(capsule)
    bob_capsule = capsule
    bobs_private_key = keys.UmbralPrivateKey.gen_key()
    bobs_public_key = bobs_private_key.get_pubkey()
    kfrags = pre.generate_kfrags(delegating_privkey=alices_private_key,
                                signer=alices_signer,
                                receiving_pubkey=bobs_public_key,
                                threshold=10,
                                N=20)
    print(kfrags)
    bob_capsule.set_correctness_keys(delegating=alices_public_key,
                                 receiving=bobs_public_key,
                                 verifying=alices_verifying_key)
    # return bob_capsule

get_signer_keys ()