/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/05 11:51:16 by ertrigna          #+#    #+#             */
/*   Updated: 2026/06/05 11:51:19 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const express = require('express');
const fs = require('fs');
const readline = require('readline');

const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let tracerouteData = [];

// Mode: lire depuis stdin (pipe du traceroute)
if (process.argv[2] === '--input') {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (line) => {
        try {
            const hop = JSON.parse(line);
            tracerouteData.push(hop);
            console.log(`[HOP ${hop.ttl}] ${hop.ip} - ${hop.is_timeout ? 'TIMEOUT' : hop.rtt[0].toFixed(2) + 'ms'}`);
        } catch (e) {
            // Ignorer les erreurs de parse
        }
    });

    rl.on('close', () => {
        console.log('✓ Trace complete! Open http://localhost:3000');
    });
}

// API pour le frontend
app.get('/api/trace', (req, res) => {
    res.json(tracerouteData);
});

app.post('/api/trace', (req, res) => {
    tracerouteData = req.body;
    res.json({ success: true, count: tracerouteData.length });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Visualizer running on http://localhost:${PORT}`);
    if (process.argv[2] === '--input') {
        console.log('Reading traceroute data from stdin...');
    }
});