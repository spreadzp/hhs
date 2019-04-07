from umbral import pre, keys, config, signing
import json
 
config.set_default_curve()

def get_private_key ():
    alices_private_key = keys.UmbralPrivateKey.gen_key()
    alices_public_key = alices_private_key.get_pubkey()
    newkeys = {"privateKey": alices_private_key, "publicKey": alices_public_key}
    print (newkeys)
    # json_data = '{"name": "Brian", "city": "Seattle"}'
    # python_obj = json.loads(json_data)
    # newkeys = {"privateKey": alices_private_key, "publicKey": "Seattle"}
    # print (json.dumps(python_obj, sort_keys=True, indent=4))
    # print(json.dumps(keys.UmbralPrivateKey, sort_keys=True, indent=4 ))
    
    return newkeys

get_private_key ()