#!/bin/bash

# Script de deploy para Docker Swarm
# StorageKit API

set -e

echo "╔════════════════════════════════════════╗"
echo "║     StorageKit - Deploy Script        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis
STACK_NAME="storagekit"
IMAGE_NAME="storagekit:latest"
COMPOSE_FILE="docker-compose.yml"

# Função para verificar se está no Swarm
check_swarm() {
    if ! docker info | grep -q "Swarm: active"; then
        echo -e "${RED}❌ Docker Swarm não está ativo!${NC}"
        echo "Execute: docker swarm init"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker Swarm está ativo${NC}"
}

# Função para verificar se a rede existe
check_network() {
    if ! docker network ls | grep -q "network_public"; then
        echo -e "${YELLOW}⚠ Rede 'network_public' não encontrada!${NC}"
        echo "Deseja criar a rede? (s/n)"
        read -r response
        if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
            docker network create --driver overlay network_public
            echo -e "${GREEN}✓ Rede criada${NC}"
        else
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Rede 'network_public' existe${NC}"
    fi
}

# Função para build da imagem
build_image() {
    echo ""
    echo -e "${YELLOW}🔨 Building imagem Docker...${NC}"
    docker build -t $IMAGE_NAME .
    echo -e "${GREEN}✓ Imagem criada com sucesso${NC}"
}

# Função para fazer deploy
deploy_stack() {
    echo ""
    echo -e "${YELLOW}🚀 Fazendo deploy da stack...${NC}"
    docker stack deploy -c $COMPOSE_FILE $STACK_NAME
    echo -e "${GREEN}✓ Stack deployada${NC}"
}

# Função para verificar status
check_status() {
    echo ""
    echo -e "${YELLOW}📊 Status do serviço:${NC}"
    sleep 3
    docker service ls | grep $STACK_NAME
}

# Função para mostrar logs
show_logs() {
    echo ""
    echo -e "${YELLOW}📋 Últimos logs (Ctrl+C para sair):${NC}"
    echo ""
    docker service logs -f ${STACK_NAME}_storagekit
}

# Menu principal
main() {
    echo "Selecione uma opção:"
    echo "1) Deploy completo (build + deploy)"
    echo "2) Apenas build da imagem"
    echo "3) Apenas deploy"
    echo "4) Ver status"
    echo "5) Ver logs"
    echo "6) Remover stack"
    echo "7) Sair"
    echo ""
    read -p "Opção: " option

    case $option in
        1)
            check_swarm
            check_network
            build_image
            deploy_stack
            check_status
            echo ""
            echo -e "${GREEN}✅ Deploy completo!${NC}"
            echo ""
            echo "Teste a API:"
            echo "  curl https://seu-dominio.com/health"
            echo ""
            read -p "Ver logs? (s/n): " logs
            if [[ "$logs" =~ ^([sS][iI][mM]|[sS])$ ]]; then
                show_logs
            fi
            ;;
        2)
            build_image
            ;;
        3)
            check_swarm
            check_network
            deploy_stack
            check_status
            ;;
        4)
            check_status
            ;;
        5)
            show_logs
            ;;
        6)
            echo -e "${RED}⚠ Removendo stack...${NC}"
            docker stack rm $STACK_NAME
            echo -e "${GREEN}✓ Stack removida${NC}"
            ;;
        7)
            echo "Até logo!"
            exit 0
            ;;
        *)
            echo -e "${RED}Opção inválida${NC}"
            exit 1
            ;;
    esac
}

# Executar
main

