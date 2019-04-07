import random, io, json, shelve 
from umbral import pre, keys, config, signing
from umbral.keys import UmbralPublicKey, UmbralPrivateKey
from PIL import Image
 
def create_keys ():
    doctor_private_key = ""
    doctor_public_hex = ""
    shelf = shelve.open('python/proxy/doctor_private_key')
    if 'privKey' in shelf:
        doctor_private_key = UmbralPrivateKey.from_bytes(bytes.fromhex(shelf['privKey']))     
    else:
        doctor_private_key = keys.UmbralPrivateKey.gen_key()
        doctor_public_hex = doctor_private_key.to_bytes().hex()
        shelf["privKey"] = doctor_public_hex 
        
    shelf.close()

    doctor_public_key = doctor_private_key.get_pubkey()
    doctor_public_hex = doctor_public_key.to_bytes().hex()
    return doctor_private_key

def get_doctor_public_key ():
    return create_keys().get_pubkey() 

def get_doctor_private_key ():
    return create_keys() 