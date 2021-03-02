# video-maker
Projeto open source para fazer vídeos automatizados

# Stack

## Readline-sync
- Framework para input de dados via terminal

## Algorithmia 
- Um marketplace de Machine Learning e Algoritmos com N possibilidades de aplicação. 
- Para essa API utilizaremos para consultar e extrair conteúdos do Wikipedia.
- https://algorithmia.com/

## SBD - Sentence Boundary Detection
- Uma lib especializada em quebrar textos em sentenças, respeitando virgulas, pontos e siglas.

## IBM Watson
- Capturar keywords para cada senteça que o SBD localizou

- https://www.npmjs.com/package/ibm-watson
- Navigator test: https://natural-language-understanding-demo.ng.bluemix.net/ 
- Create account: https://cloud.ibm.com/registration

# Environments

## Credentials format

###  **Algorithmia**

File: `algorithmia.json`
```
{
    "apiKey": ""
}
```

### **Watson Natural Language Understanding**

File: `watson-nlu.json`

```
{
  "apikey": "",
  "iam_apikey_description": "",
  "iam_apikey_name": "",
  "iam_role_crn": "",
  "iam_serviceid_crn": "",
  "url": ""
}
```
