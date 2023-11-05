# Description: This script is used to seed the database with data from the data folder
# !pip install requests
# python scripts/seed_script.py to run from main folder

import requests

def call_local_endpoint(prompt):
    #TODO: Change this to the correct URL when activesearch endpoint is changed
    url = f'http://localhost:8080/search?rootquery="{prompt}"'
    
    try:
        response = requests.get(url)
        
        # Check if the response was successful (status code 200)
        if response.status_code == 200:
            print("Request to localhost:8080/search was successful!")
            print("Response content:")
            print(response.text)
        else:
            print(f"Request to localhost:8080/active failed with status code: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    #Get Open API files
    call_local_endpoint("openapi: 3")
    #Get Swagger files
    call_local_endpoint("swagger: 2")

#PS: Takes a long time to run