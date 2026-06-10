/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   parsing.c                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/03 15:45:56 by eric              #+#    #+#             */
/*   Updated: 2026/06/05 15:46:33 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "traceroute.h"

int	parse_icmp(char *buf)
{
	struct ip	*ip_hdr;
	struct icmp	*icmp_hdr;
	
	ip_hdr = (struct ip *)buf;
	icmp_hdr = (struct icmp *)(buf + (ip_hdr->ip_hl * 4));
	if (icmp_hdr->icmp_type == ICMP_TIMXCEED)
		return (ICMP_TIMXCEED);
	if (icmp_hdr->icmp_type == ICMP_UNREACH)
		return (ICMP_UNREACH);
	return (-1);
}

int parse_args(int ac, char *av[], t_traceroute *trace)
{
	int	i;

	i = 1;
	while (i < ac)
	{
		if (ft_strcmp(av[i], "--help") == 0 || ft_strcmp(av[i], "-h") == 0)
		{
			print_usage(av[0]);
			exit(0);
		}	
		else if (ft_strcmp(av[i], "-m") == 0 && i + 1 < ac)	// -> flag bonus nombre max de hops
			trace->max_ttl = ft_atoi(av[++i]);
		else if (ft_strcmp(av[i], "-q") == 0 && i + 1 < ac)	// -> flag bonus nombre de probes par hops
			trace->probes_per_ttl = ft_atoi(av[++i]);
		else if (ft_strcmp(av[i], "-w") == 0 && i + 1 <  ac)	// -> flag bonus timeout
			trace->timeout = ft_atoi(av[++i]);
		else if (ft_strcmp(av[i], "-n") == 0)					// -> flag bonus dns 
			trace->no_dns = 1;
		else if (ft_strcmp(av[i], "-p") == 0 && i + 1 < ac)	// -> flag bonus choix port
			trace->port = ft_atoi(av[++i]);
		else if (ft_strcmp(av[i], "-f") == 0 && i + 1 < ac)	// -> flag bonus choix du start TTL (default : 1)
			trace->ttl = ft_atoi(av[++i]);
		else if (ft_strcmp(av[i], "-j") == 0)
			trace->json_output = 1;
		else if (av[i][0] != '-')							
			return (i);
		else
		{
			fprintf(stderr, "Unknow option: %s\n", av[i]);
			print_usage(av[0]);
			return (-1);
		}
		i++;
	}
	fprintf(stderr, "Missing hostname\n");
	print_usage(av[0]);
	return (-1);
}
