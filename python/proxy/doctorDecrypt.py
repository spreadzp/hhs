import sys, random, io, json, shelve, base64
from doctorPublicKey import get_doctor_private_key, get_doctor_public_key 
from umbral import pre, keys, config, signing, params
from umbral.config import default_params
from umbral.cfrags import CapsuleFrag
from umbral.kfrags import KFrag
from umbral.keys import UmbralPublicKey, UmbralPrivateKey
from pprint import pprint
from PIL import Image

#pprint(sys.argv[0])
#pprint(sys.argv[1])
config.set_default_curve()
#curve = config.default_curve()
#params = params.UmbralParameters(curve=curve)
params = default_params()
capsule_from_server = pre.Capsule.from_bytes(bytes.fromhex(sys.argv[1]), params)
shelf = shelve.open('python/proxy/mydata')
ciphertext_original = shelf["ciphertext_original"]
cleartext = shelf["cleartext"]
ciphertext_bytes = shelf["ciphertext"]


pprint("&&&&&&&&&&&&&&&&&&&&&capsule_from_file")
pprint(capsule_from_server)
priv_key = get_doctor_private_key()
#pprint(ciphertext_bytes)
#bob_cleartext = pre.decrypt(ciphertext=ciphertext_original, capsule=capsule_from_server, decrypting_key=priv_key)
shelf.close()
## print("bob_cleartext")
## print(bob_cleartext)
#image = Image.open(io.BytesIO(bob_cleartext))
#image.save("python/proxy/35.jpg") 
pprint("success decript image!")