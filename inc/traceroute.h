/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   traceroute.h                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/03 16:11:50 by eric              #+#    #+#             */
/*   Updated: 2026/06/05 11:43:50 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef TRACEROUTE_H
#define TRACEROUTE_H

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <netdb.h>

#include <sys/socket.h>
#include <sys/select.h>
#include <sys/time.h>
#include <netinet/ip.h>
#include <netinet/ip_icmp.h>
#include <arpa/inet.h>

#include "output.h"

typedef struct s_traceroute
{
	int						send_fd;
	int						recv_fd;
	char					*hostname;
	struct	sockaddr_in		dest;
	
	int						ttl;
	int						max_ttl;
	int						probes_per_ttl;

	int						sequence;
	pid_t					pid;
	int						timeout;
	int						no_dns;
	int						port;

	int						json_output;
	
	struct timeval			start;
	struct timeval			end;
	
} t_traceroute;

/*UTILS*/
void	*ft_memset(void *ptr, int value, size_t len);
int		ft_atoi(const char *str);
double	calc_rtt(t_traceroute *trace);
void	print_usage(char *str);

/*INIT*/
void	init_traceroute(t_traceroute *trace);												// -> init structure traceroute

/*SOCKET*/
int		create_recv_socket(void); 															// -> socket RAW ICMP pour recevoir
int		create_send_socket(void);													// -> socket UDP pour envoyer
int		resolve_host(t_traceroute* trace, char *hostname);									// -> resout le hostname en IP

/*PARSING*/
int		parse_icmp(char *buf);																// -> parsing icmp, lit le buffer et retourne le type
int 	parse_args(int ac, char *av[], t_traceroute *trace);								// -> parsing des arguments

/*TRACEROUTE*/
void	send_probe(t_traceroute *trace);
int		wait_response(t_traceroute *trace, struct sockaddr_in *recv_addr, char *buf);
void	print_hop(struct sockaddr_in *recv_addr, t_traceroute *trace);
void	print_timeout(void);
void	run_traceroute(t_traceroute *trace);

/*OUTPUT*/
void	output_hop_data(t_traceroute *trace, int ttl, char *ip, char *hostname, double rtt1, double rtt2, double rtt3, int is_timeout);

#endif
