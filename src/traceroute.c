/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   traceroute.c                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/03 16:09:51 by eric              #+#    #+#             */
/*   Updated: 2026/06/05 12:03:38 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "traceroute.h"

void	send_probe(t_traceroute *trace)
{
	setsockopt(trace->send_fd, IPPROTO_IP, IP_TTL, &trace->ttl, sizeof(trace->ttl));
	trace->dest.sin_port = htons(trace->port + trace->sequence);
	gettimeofday(&trace->start, NULL);
	sendto(trace->send_fd, NULL, 0, 0, (struct sockaddr *)&trace->dest, sizeof(trace->dest));
	trace->sequence++;
}

int	wait_response(t_traceroute *trace, struct sockaddr_in *recv_addr, char *buf)
{
	fd_set			fds;
	struct timeval	timeout;
	socklen_t		addr_len;

	FD_ZERO(&fds);
	FD_SET(trace->recv_fd, &fds);
	timeout.tv_sec = trace->timeout;
	timeout.tv_usec = 0;
	if (select(trace->recv_fd + 1, &fds, NULL, NULL, &timeout) <= 0)
		return (-1);
	addr_len = sizeof(*recv_addr);
	recvfrom(trace->recv_fd, buf, 512, 0, (struct sockaddr *)recv_addr, &addr_len);
	gettimeofday(&trace->end, NULL);
	return (parse_icmp(buf));
}

void	print_hop(struct sockaddr_in *recv_addr, t_traceroute *trace)
{
	char	host[NI_MAXHOST];
	double	rtt;

	rtt = calc_rtt(trace);
	if (trace->no_dns)
		printf("%s  %.3f ms  ", inet_ntoa(recv_addr->sin_addr), rtt);
	else
	{
		getnameinfo((struct sockaddr *)recv_addr, sizeof(*recv_addr), host, sizeof(host), NULL, 0, 0);
		printf("%s (%s)  %.3f ms  ", host, inet_ntoa(recv_addr->sin_addr), rtt);	
	}
}

void	print_timeout(void)
{
	printf("* ");
}

void	run_traceroute(t_traceroute *trace)
{
	struct sockaddr_in	recv_addr;
	struct sockaddr_in	first_addr;
	char				buf[512];
	int					probe;
	int					ret;
	int					done;
	int					first_printed;
	double				rtt1, rtt2, rtt3;
	int					timeout_count;

	done = 0;
	printf("traceroute to %s, %d hops max\n", inet_ntoa(trace->dest.sin_addr), trace->max_ttl);
	while (trace->ttl <= trace->max_ttl && !done)
	{
    	printf(" %2d  ", trace->ttl);
    	probe = 0;
    	first_printed = 0;
    	rtt1 = 0; rtt2 = 0; rtt3 = 0;  // Reset pour ce TTL
   		timeout_count = 0;
    	ft_memset(&first_addr, 0, sizeof(first_addr));
    
    	while (probe < trace->probes_per_ttl)
    	{
        	send_probe(trace);
        	ret = wait_response(trace, &recv_addr, buf);
        	if (ret == -1)
        	{
            	timeout_count++;
            	print_timeout();
        	}
        	else
        	{
            	double rtt = calc_rtt(trace);
            	// Stocker les RTT pour JSON output
            	if (probe == 0) 
					rtt1 = rtt;
            	else if (probe == 1) 
					rtt2 = rtt;
            	else if (probe == 2) 
					rtt3 = rtt;
            	if (!first_printed || recv_addr.sin_addr.s_addr != first_addr.sin_addr.s_addr)
                	print_hop(&recv_addr, trace);
            	else
                	printf("%.3f ms  ", rtt);
            	first_addr = recv_addr;
            	first_printed = 1;
            	if (ret == ICMP_UNREACH)
                	done = 1;
        	}
        	probe++;
    	}
    // Output JSON si flag activé
    if (trace->json_output && first_printed)
    {
        char ip_str[INET_ADDRSTRLEN];
        char hostname[256];
        strcpy(ip_str, inet_ntoa(first_addr.sin_addr));
        getnameinfo((struct sockaddr *)&first_addr, sizeof(first_addr), hostname, sizeof(hostname), NULL, 0, 0);
        output_hop_data(trace, trace->ttl, ip_str, hostname, rtt1, rtt2, rtt3, (timeout_count == 3));
    }
    printf("\n");
    trace->ttl++;
}
