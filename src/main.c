/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: eric <eric@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/03 15:45:39 by eric              #+#    #+#             */
/*   Updated: 2026/03/06 10:28:42 by eric             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "traceroute.h"

int main(int ac, char *av[])
{
	int host_idx;
	if (ac < 2)
	{
		fprintf(stderr, "Usage: %s <destination> [options]\n", av[0]);
		return (-1);
	}
	t_traceroute trace;
	init_traceroute(&trace);
	host_idx = parse_args(ac, av, &trace);
	if (host_idx < 0)
		return (1);
	if (resolve_host(&trace, av[host_idx]) < 0)
		return (1);
	trace.recv_fd = create_recv_socket();
	if (trace.recv_fd < 0)
		return (1);
	trace.send_fd = create_send_socket();
	if (trace.send_fd < 0)
		return (1);
	run_traceroute(&trace);
	close(trace.recv_fd);
	close(trace.send_fd);
	return (0);
}
