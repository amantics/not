# Notary

Hébergement [Notary](https://notarys.herokuapp.com/)

## About

une application permettant de gérer les transactions immobilières avec Blockchain grâce à l'utilisation de contrats
intelligents afin de garantir la transparence, l'absence de fraude et la continuité des transactions immobilières.

## Prereqisites

- Node >= V16
- pg 

## Postgres instructions
- Run docker compose from the compose-postgres folder ``docker-compose up -d`` the credentials are indicated in the RM found in the folder

## Run Locally (EN)

1. Copy .env.template to .env and fill in the values (account, private_key, host, etc)
````bash
cp .env.template .env
````
2. Install dependencies

```bash
  pnpm install
```

3. Run hardhat service from docker-compose.yml (optional for hardhat network use) and fill ETHERS_ACCOUNT_PRIVATE_KEY and ETHERS_ACCOUNT_ADDRESS variables from hardhat.

```bash
  docker-compose up hardhat
```

4. Deploy contract on (hardhat/private) network and fill VUE_APP_ETHERS_CONTRACT_ADDRESS in .env

```bash
  pnpm operations:deploy localhost
  ```

5. Run All services (hardhat is already up if you run it but db and server will run now)

```bash
  docker-compose up -d
```

NOTE: after running app services you need to wait internal build because there are issues with vue not detecting .env
variables on image build.

6. Access the application at http://localhost:3000

## Run Locally (FR)

1. Copier .env.template to .env et remplir les valeurs (account, private_key, host, etc)
````bash
cp .env.template .env
````
2. Installer les dépendances

```bash
  pnpm install
```

3. Lancer le service hardhat depuis docker-compose.yml (optionnel pour le réseau hardhat) et remplir les variables ETHERS_ACCOUNT_PRIVATE_KEY et ETHERS_ACCOUNT_ADDRESS à partir de hardhat.

```bash
  docker-compose up hardhat
```

4. Déployer le contrat sur le réseau (hardhat/private) et remplir VUE_APP_ETHERS_CONTRACT_ADDRESS dans .env

```bash
  pnpm operations:deploy localhost
  ```

5. Lancer tous les services (hardhat est déjà en cours d'exécution si vous l'avez exécuté, mais db et server seront
   exécutés maintenant)

```bash
 docker-compose up -d
```

NOTE: après l'exécution des services de l'application, vous devez attendre la construction interne car il existe des
problèmes avec vue ne détectant pas les variables .env

6. Accéder à l'application à l'adresse http://localhost:3000