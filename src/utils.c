/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   utils.c                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: eric <eric@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/03 15:46:10 by eric              #+#    #+#             */
/*   Updated: 2026/03/06 13:56:41 by eric             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "traceroute.h"

void	*ft_memset(void *ptr, int value, size_t len)
{
	if (ptr == NULL)
		return (NULL);
	size_t i = 0;
	unsigned char *p = (unsigned char *) ptr;
	while (i < len)
	{
		p[i] = (unsigned char) value;
		i++;
	}
	return (ptr);
}

int	ft_strcmp(const char *s1, const char *s2)
{
	size_t i;
	
	i= 0;
	while (s1[i] && s2[i] && s1[i] == s2[i])
		i++;
	return ((unsigned char)s1[i] - (unsigned char)s2[i]);
}

char	*ft_strcpy(char *dest, const char *src)
{
	size_t i;

	i = 0;
	while (src[i])
	{
		dest[i] = src[i];
		i++;
	}
	dest[i] = '\0';
	return (dest);
}

double	calc_rtt(t_traceroute *trace)
{
	return ((trace->end.tv_sec - trace->start.tv_sec) * 1000.0 + (trace->end.tv_usec - trace->start.tv_usec) / 1000.0);
}

int		ft_atoi(const char *str)
{
	int i;
	int sign;
	int	nb;

	i = 0;
	sign = 1;
	nb = 0;
	while ((str[i] >= 9 && str[i] <= 13) || str[i] == 32)
		i++;
	if (str[i] == '-' || str[i] == '+')
	{
		if (str[i] == '-')
			sign *= -1;
		i++;
	}
	while (str[i] >= '0' && str[i] <= '9')
	{
		nb = nb * 10 + (str[i] - 48);
		i++;
	}
	return (nb * sign);
}

void	print_usage(char *str)
{
	fprintf(stderr, "Usage: %s [-m max_ttl] [-q nqueries] [-w timeout] host\n", str);
	fprintf(stderr, "Options: \n");
	fprintf(stderr, "	-m max_ttl		Max number of hops (default: 30)\n");
	fprintf(stderr, "	-q nqueries		Number of probes per hop (default: 3)\n");
	fprintf(stderr, "	-w timeout		Timeout in seconds (default: 3)\n");
	fprintf(stderr, "	-n			No DNS resolution\n");
	fprintf(stderr, "	--help			Show this help\n");
}
