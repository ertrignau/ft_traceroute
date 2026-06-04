/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: eric <eric@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/03 15:45:54 by eric              #+#    #+#             */
/*   Updated: 2026/03/06 13:53:25 by eric             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "traceroute.h"

void	init_traceroute(t_traceroute *trace)
{
	ft_memset(trace, 0, sizeof(t_traceroute)); // init a 0 dest, start et end
	
	trace->send_fd = -1;
	trace->recv_fd = -1;
	trace->ttl = 1;
	trace->max_ttl = 30;
	trace->probes_per_ttl = 3;
	trace->sequence = 0;
	trace->timeout = 1;
	trace->port = 33434;
	trace->pid = getpid();
	trace->hostname = NULL;
}
