/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.c                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: eric <eric@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/03 15:46:02 by eric              #+#    #+#             */
/*   Updated: 2026/03/06 12:18:39 by eric             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "traceroute.h"

int	create_recv_socket(void)
{
	int sockfd;
	sockfd = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP);
	if (sockfd < 0)
	{
		fprintf(stderr, "You must run as root to create raw socket\n");
		return (-1);
	}
	return (sockfd);
}

int	create_send_socket(void)
{
	int sockfd;
	sockfd = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
	if (sockfd < 0)
	{
		fprintf(stderr, "socket send: %s\n", strerror(errno));
		return (-1);
	}
	return (sockfd);
}

int	resolve_host(t_traceroute* trace, char *hostname)
{
	struct addrinfo	hints;
	struct addrinfo	*res;
	int				ret;

	ft_memset(&hints, 0, sizeof(struct addrinfo));
	hints.ai_family = AF_INET;
	hints.ai_socktype = SOCK_DGRAM;

	trace->hostname = hostname;
	ret = getaddrinfo(hostname, NULL, &hints, &res);
	if (ret != 0)
	{
		fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(ret));
		return (-1);
	}
	trace->dest = *(struct sockaddr_in *)res->ai_addr;
	freeaddrinfo(res);
	return (0);
}