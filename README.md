# token-onliner
token onliner set tokens online


.env file required

--start

# Token Configuration
TOKENS=user123-token,device456-token,server789-token,app101-token

# Optional: Individual token metadata (JSON format)
TOKEN_user123_token_METADATA={"type":"user","permissions":"admin"}
TOKEN_device456_token_METADATA={"type":"device","model":"v2.0"}
TOKEN_server789_token_METADATA={"type":"server","region":"us-east"}
TOKEN_app101_token_METADATA={"type":"application","version":"1.3.5"}

--end
