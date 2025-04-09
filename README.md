# Pré-requis

- Installer node (la version 22 est la TLS)
- Installer npm


# Installation

- create-react-app est deprecated (https://create-react-app.dev/docs/adding-typescript/)
- Doc de création d'app : https://react.dev/blog/2025/02/14/sunsetting-create-react-app
- Doc spécifique pour vite : https://vite.dev/guide/

## Avec vite

- React.js : `npm create vite@latest <nom-app> -- --template react`
- React.ts : `npm create vite@latest <nom-app> -- --template react-ts`

### Remarques

- Si l'IDE affiche des erreurs par rapport à react/jsx-runtime lorsqu'on ouvre un fichier tsx, penser à bien faire "npm install" pour que les node modules du nouveau projet s'installe