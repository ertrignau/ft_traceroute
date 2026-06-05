# 🌐 ft_traceroute

<div align="center">

![C](https://img.shields.io/badge/C-11-blue?style=for-the-badge\&logo=c)
![Linux](https://img.shields.io/badge/Linux-Networking-FCC624?style=for-the-badge\&logo=linux\&logoColor=black)
![ICMP](https://img.shields.io/badge/Protocol-ICMP-green?style=for-the-badge)
![IPv4](https://img.shields.io/badge/IPv4-Routing-orange?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Visualizer-339933?style=for-the-badge\&logo=node.js\&logoColor=white)
![42](https://img.shields.io/badge/42-Network_Project-black?style=for-the-badge)

**Réimplémentation du programme `traceroute` en C avec export JSON et visualiseur web**

</div>

---

## 📖 Présentation

**ft_traceroute** est une réimplémentation du programme Unix `traceroute` en C.

Il permet de déterminer le chemin emprunté par les paquets IP entre une machine source et une destination en augmentant progressivement le TTL et en analysant les réponses ICMP des routeurs intermédiaires.

Un visualiseur web permet d’exploiter les données générées au format JSON.

---

## ✨ Fonctionnalités

* Traceroute basé sur ICMP
* Gestion du TTL (*Time To Live*)
* Mesure des RTT (*Round Trip Time*)
* Résolution DNS inverse
* Export JSON des résultats
* Visualisation web (Node.js)
* Utilisation de sockets RAW

---

## 📁 Structure du projet

```text
.
├── inc
│   ├── output.h
│   └── traceroute.h
├── Makefile
├── src
│   ├── init.c
│   ├── main.c
│   ├── output.c
│   ├── parsing.c
│   ├── socket.c
│   ├── traceroute.c
│   └── utils.c
└── visualiseur
    ├── package.json
    ├── package-lock.json
    ├── public
    │   ├── index.html
    │   └── viewer.js
    └── server.js
```

---

## 🔨 Compilation

```bash
make
```

Nettoyage :

```bash
make clean
```

Suppression complète :

```bash
make fclean
```

Recompilation :

```bash
make re
```

---

## 🚀 Utilisation

```bash
sudo ./ft_traceroute <destination>
```

Exemples :

```bash
sudo ./ft_traceroute google.com
sudo ./ft_traceroute 8.8.8.8
```

---

## 📡 Fonctionnement

Pour chaque valeur de TTL :

* Envoi de plusieurs sondes
* Attente des réponses ICMP
* Calcul du RTT
* Identification du routeur intermédiaire
* Arrêt si la destination est atteinte

---

## 📊 Visualiseur Web

Installation :

```bash
cd visualiseur
npm install
```

Lancement :

```bash
node server.js
```

Accès :

```text
http://localhost:3000
```

---

## 🧠 Concepts réseau

* ICMP
* IPv4
* TTL
* Routage IP
* DNS inverse
* Sockets RAW
* Mesure de latence

---

## 👨‍💻 Auteur

Projet réalisé dans le cadre de 42.
