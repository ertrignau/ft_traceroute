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

typedef struct s_hop
{
	int		ttl;
	char	ip[INET_ADDRSTRLEN];
	char	hostname[256];
	double	rtt[3];  // 3 probes
	int		is_timeout;
} t_hop;

void	print_hop_json(t_hop *hop);

#endif
