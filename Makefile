NAME		= ft_traceroute

CC		= gcc
CFLAGS		= -Wall -Wextra -Werror
INCLUDES	= -I inc/
OBJ_DIR		= obj/

SRCS		= src/main.c \
		  src/init.c \
		  src/parsing.c \
		  src/socket.c \
		  src/traceroute.c \
		  src/output.c \
		  src/utils.c

OBJS		= $(addprefix $(OBJ_DIR), $(SRCS:.c=.o))
TOTAL		= $(words $(SRCS))

# Colors
RED		= \033[1;31m
GREEN		= \033[1;32m
YELLOW		= \033[1;33m
BLUE		= \033[1;34m
CYAN		= \033[1;36m
RESET		= \033[0m

all: header $(NAME)

header:
	@echo "$(GREEN)"
	@echo "╔═════════════════════════════════════════════════════════════╗"
	@echo "║                                                             ║"
	@echo "║           		   🚀 FT_TRACEROUTE 🚀                       ║"
	@echo "║                                                             ║"
	@echo "╚═════════════════════════════════════════════════════════════╝"
	@echo "$(RESET)"

$(NAME): $(OBJS)
	@printf "$(BLUE)🔗 Linking...$(RESET)\n"
	@$(CC) $(CFLAGS) $(OBJS) -o $(NAME)
	@echo "$(GREEN)✅ $(NAME) compiled successfully!$(RESET)"

CURRENT = 0
$(OBJ_DIR)%.o: %.c
	@mkdir -p $(dir $@)
	$(eval CURRENT := $(shell echo $$(($(CURRENT) + 1))))
	$(eval PERCENT := $(shell echo $$(($(CURRENT) * 100 / $(TOTAL)))))
	$(eval FILLED := $(shell echo $$(($(CURRENT) * 30 / $(TOTAL)))))
	$(eval EMPTY := $(shell echo $$((30 - $(FILLED)))))
	@printf "$(GREEN)█$(RESET) Compilation: $(CYAN)["
	@printf "$(GREEN)%0.s▓$(RESET)" $(shell seq 1 $(FILLED)) 2>/dev/null || true
	@printf "$(YELLOW)%0.s░$(RESET)" $(shell seq 1 $(EMPTY)) 2>/dev/null || true
	@printf "$(CYAN)] $(GREEN)%3d%%$(RESET)\n" $(PERCENT)
	@$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

clean:
	@rm -rf $(OBJ_DIR)
	@echo "$(YELLOW)🧹 Objects cleaned!$(RESET)"

fclean: clean
	@rm -f $(NAME)
	@echo "$(RED)🧹 $(NAME) removed!$(RESET)"

re: fclean all

.PHONY: all clean fclean re header
