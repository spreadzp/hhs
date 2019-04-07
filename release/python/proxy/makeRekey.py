#1
# Sets a default curve (secp256k1)
import random, io
from pprint import pprint
from umbral import pre, keys, config, signing
from PIL import Image

config.set_default_curve()

def make_rekey () :
    alices_private_key = keys.UmbralPrivateKey.gen_key()
    alices_public_key = alices_private_key.get_pubkey()

    alices_signing_key = keys.UmbralPrivateKey.gen_key()
    alices_verifying_key = alices_signing_key.get_pubkey()
    alices_signer = signing.Signer(private_key=alices_signing_key)
    pprint(alices_private_key)
    print(alices_public_key)
    pprint(alices_signing_key)
    print(alices_verifying_key)
    pprint(alices_signer) 
    print("--------") 

    #3
    # Encrypt some data for Alice
    # ---------------------------
    # Now let's encrypt data with Alice's public key.
    # Invocation of `pre.encrypt` returns both the `ciphertext`,
    # and a `capsule`. Anyone with Alice's public key can perform
    # this operation.
    with open("./23.jpg", "rb") as imageFile:
        f = imageFile.read()
        plaintext = bytes(f)
    print("imgStart")
    # print(b)
    print("imgEnd")

    # plaintext = b'Proxy Re-encryption is cool!'
    print("@@@@")
    # print(plaintext)
    ciphertext, capsule = pre.encrypt(alices_public_key, plaintext)
    print(capsule)


    #4
    # Decrypt data for Alice
    # ----------------------
    # Since data was encrypted with Alice's public key,
    # Alice can open the capsule and decrypt the ciphertext with her private key.

    cleartext = pre.decrypt(ciphertext=ciphertext,
                            capsule=capsule,
                            decrypting_key=alices_private_key)

    image_cleartext = Image.open(io.BytesIO(cleartext))
    image_cleartext.save("231.jpg")
    # print(cleartext)

    #5
    # Bob Exists
    # -----------

    bobs_private_key = keys.UmbralPrivateKey.gen_key()
    bobs_public_key = bobs_private_key.get_pubkey()

    #6
    # Bob receives a capsule through a side channel (s3, ipfs, Google cloud, etc)
    bob_capsule = capsule
    print("Bob")
    print(bobs_private_key)
    print(bobs_public_key)
    print(bob_capsule)

    #7
    # Attempt Bob's decryption (fail)
    try:
        fail_decrypted_data = pre.decrypt(ciphertext=ciphertext,
                                        capsule=bob_capsule,
                                        decrypting_key=bobs_private_key)
    except:
        print("Decryption failed! Bob doesn't has access granted yet.")

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

    print(" Alice grants access to Bob by generating kfrags")
    print(kfrags)                                
    return kfrags

make_rekey()