/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   output.c                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/05 11:44:23 by ertrigna          #+#    #+#             */
/*   Updated: 2026/06/05 11:55:11 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "traceroute.h"

void	print_hop_json(t_hop *hop)
{
	printf("{\"ttl\":%d,\"ip\":\"%s\",\"hostname\":\"%s\",\"rtt\":[%.3f,%.3f,%.3f],\"is_timeout\":%d}\n",
		hop->ttl, hop->ip, hop->hostname, hop->rtt[0], hop->rtt[1], hop->rtt[2], hop->is_timeout);
}

void	output_hop_data(t_traceroute *trace, int ttl, char *ip, char *hostname, double rtt1, double rtt2, double rtt3, int is_timeout)
{
	t_hop hop;

	ft_memset(&hop, 0, sizeof(t_hop));
	hop.ttl = ttl;
	strcpy(hop.ip, ip);
	strcpy(hop.hostname, hostname);
	hop.rtt[0] = rtt1;
	hop.rtt[1] = rtt2;
	hop.rtt[2] = rtt3;
	hop.is_timeout = is_timeout;
	
	if (trace->json_output)
		print_hop_json(&hop);
}
