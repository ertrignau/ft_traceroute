# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/06/05                                  #+#    #+#              #
#    Updated: 2026/06/05                                  ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME		= ft_traceroute

CC			= gcc
CFLAGS		= -Wall -Wextra -Werror -g
INCLUDES	= -I inc

SRCS_DIR	= src
OBJ_DIR		= obj

SRCS		= $(SRCS_DIR)/main.c \
			  $(SRCS_DIR)/init.c \
			  $(SRCS_DIR)/parsing.c \
			  $(SRCS_DIR)/socket.c \
			  $(SRCS_DIR)/traceroute.c \
			  $(SRCS_DIR)/output.c \
			  $(SRCS_DIR)/utils.c

OBJS		= $(addprefix $(OBJ_DIR)/,$(notdir $(SRCS:.c=.o)))

# Colors
GREEN	= \033[1;32m
YELLOW	= \033[1;33m
BLUE	= \033[1;34m
CYAN	= \033[1;36m
RESET	= \033[0m

# ===================== ALL =====================

all: $(NAME)

# ===================== BANNER =====================

banner:
	@printf "$(GREEN)"
	@printf "╔══════════════════════════════════════════════════════════════╗\n"
	@printf "║                                                              ║\n"
	@printf "║                      FT_TRACEROUTE                           ║\n"
	@printf "║              Network diagnostic tool (ICMP)                  ║\n"
	@printf "║                                                              ║\n"
	@printf "╚══════════════════════════════════════════════════════════════╝\n"
	@printf "$(RESET)\n"

# ===================== BUILD =====================

$(NAME): banner $(OBJ_DIR) $(OBJS)
	@printf "\n$(BLUE)⏳ Linking binary...$(RESET)\n"
	@i=0; \
	total=$(words $(SRCS)); \
	for f in $(OBJS); do \
		i=$$((i+1)); \
		bar=$$((i * 30 / total)); \
		printf "\r$(GREEN)["; \
		j=0; while [ $$j -lt $$bar ]; do printf "█"; j=$$((j+1)); done; \
		j=$$bar; while [ $$j -lt 30 ]; do printf "░"; j=$$((j+1)); done; \
		printf "] %3d%%" $$((i * 100 / total)); \
	done; \
	echo ""

	@$(CC) $(CFLAGS) $(OBJS) -o $(NAME)
	@echo "$(GREEN)\n✅ $(NAME) compiled successfully$(RESET)"
	@echo "Usage: sudo ./$(NAME) <destination>\n"

# ===================== COMPILATION =====================

$(OBJ_DIR):
	@mkdir -p $(OBJ_DIR)

$(OBJ_DIR)/%.o: $(SRCS_DIR)/%.c
	@mkdir -p $(OBJ_DIR)
	@printf "$(CYAN)🔨 Compiling %-20s$(RESET)\r" "$<"
	@$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

# ===================== CLEAN =====================

clean:
	@rm -rf $(OBJ_DIR)
	@echo "$(YELLOW)🧹 Objects cleaned$(RESET)"

fclean: clean
	@rm -f $(NAME)
	@echo "$(YELLOW)🧹 Binary removed$(RESET)"

re: fclean all

.PHONY: all clean fclean re banner