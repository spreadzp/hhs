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

doctor_private_key = "Empty"
shelf = shelve.open('python/proxy/doctor_private_key')

if doctor_private_key == "Empty":    
    doctor_private_key = UmbralPrivateKey.from_bytes(bytes.fromhex(shelf["privKey"]))
else:
    doctor_private_key = keys.UmbralPrivateKey.gen_key()
    priv_hex = doctor_private_key.to_bytes().hex()
    shelf["privKey"] = priv_hex        
shelf.close()

doctor_public_key = doctor_private_key.get_pubkey()

doctor_public_hex = doctor_public_key.to_bytes().hex()
verifying_key_fromBytes = UmbralPublicKey.from_bytes(bytes.fromhex(doctor_public_hex))
pprint(doctor_public_hex)
