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

const PORT = Number(process.env.PORT) || 3000;
const INPUT_MODE = process.argv[2] === '--input';

let tracerouteData = [];
let useExistingServer = false;

// Mode: lire depuis stdin (pipe du traceroute)
if (INPUT_MODE) {
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

    rl.on('close', async () => {
        if (useExistingServer) {
            try {
                const response = await fetch(`http://localhost:${PORT}/api/trace`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tracerouteData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                console.log(`✓ Trace sent to http://localhost:${PORT}`);
            } catch (error) {
                console.error(`Failed to send trace to http://localhost:${PORT}: ${error.message}`);
                process.exitCode = 1;
            }
            return;
        }

        console.log(`✓ Trace complete! Open http://localhost:${PORT}`);
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

const server = app.listen(PORT, () => {
    if (INPUT_MODE) {
        console.log('Reading traceroute data from stdin...');
    } else {
        console.log(`Visualizer running on http://localhost:${PORT}`);
    }
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        if (INPUT_MODE) {
            useExistingServer = true;
            console.log(`Port ${PORT} is already in use. Reusing the existing visualizer.`);
            return;
        }

        console.error(`Port ${PORT} is already in use. Stop the existing visualizer or run with PORT=<free-port>.`);
        process.exit(1);
    }

    throw error;
});