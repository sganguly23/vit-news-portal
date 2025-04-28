import openai
import os

from dotenv import load_dotenv, find_dotenv
_=load_dotenv(find_dotenv())

openai.api_key=os.getenv("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")
openai.api_key="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"

def get_completion(prompt, model="gpt-3.5-turbo"):
    messages=[{"role":"user","content": prompt}]
    response=openai.ChatCompletion.create(model=model,messages=messages,temperature=0,)
    return response.choices[0].message["content"]

text=f"""
India's Pragyan rover has been safely re-routed after coming face-to-face with a four-meter crater on the Moon's surface.
The Indian Space Research Organisation or ISRO tweeted Monday afternoon to say the rover had spotted the crater a safe three metres from the edge and had been directed to a safer path.
The six-wheeled, solar-powered rover will amble around the relatively unmapped region and transmit images and scientific data over its two-week lifespan.
With only 10 days remaining for the completion of one lunar day, Nilesh M Desai, Director, Space Applications Centre (SAC) on Sunday, said that the Chandrayaan-3's rover module Pragyan, moving on the surface of the moon, is in a "race against time" and that the ISRO scientists are working to cover a maximum distance of the uncharted South pole through the six-wheeled rover.
He said that the moon mission's three main objectives were: soft landing on the lunar surface, movement of the Pragyan rover and obtaining science data via payloads, attached to the rover and lander Vikram.
"Our two main objectives have been accomplished successfully, but our third objective is underway," the scientist said.
Earlier on Sunday, the ISRO said the Chandrayaan-3 mission's lander module has successfully begun doing its set of experiments and subsequently relaying them back to the country's space agency's headquarters.
The space agency has also released a graph of the temperature variation on lunar surface with increase in depth measured by the ChaSTE payload onboard Chandrayaan-3's Vikram lander module.
The payload has a temperature probe equipped with a controlled penetration mechanism capable of reaching a depth of 10 cm beneath the surface.
India took a giant leap on August 23, as the Chandrayaan-3 lander module successfully landed on the Moon's South pole, making it the first country to have achieved the historic feat.
The country became the fourth – after the US, China, and Russia – to have successfully landed on the moon's surface.
"""

t=text.split()
l=len(t)
if l<=65:
    print(text)
else:
    prompt = f"""
    Summarize the text in exact 50 words
    {text}
    """

    response = get_completion(prompt)
    r=response.split()
    print("No. of words=",len(r))
    print("OUTPUT\n",response)