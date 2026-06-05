/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   output.h                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/05 11:40:55 by ertrigna          #+#    #+#             */
/*   Updated: 2026/06/05 11:44:19 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef OUTPUT_H
#define OUTPUT_H

typedef struct s_traceroute t_traceroute;

typedef struct s_hop
{
	int		ttl;
	char	ip[INET_ADDRSTRLEN];
	char	hostname[256];
	double	rtt[3];  // 3 probes
	int		is_timeout;
} t_hop;

void	print_hop_json(t_hop *hop);
void	output_hop_data(t_traceroute *trace, int ttl, char *ip, char *hostname, double rtt1, double rtt2, double rtt3, int is_timeout);

#endif
