CREATE DATABASE IF NOT EXISTS sos_guincho
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sos_guincho;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  login VARCHAR(80) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('cliente', 'administrador', 'motorista') NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  endereco VARCHAR(255),
  CONSTRAINT fk_clientes_usuarios
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS motoristas (
  id_motorista INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  cnh VARCHAR(30) NOT NULL,
  placa_guincho VARCHAR(12) NOT NULL,
  disponibilidade BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_motoristas_usuarios
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS veiculos (
  id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  placa VARCHAR(10) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  CONSTRAINT fk_veiculos_clientes
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON DELETE CASCADE,
  UNIQUE KEY uk_cliente_placa (id_cliente, placa)
);

CREATE TABLE IF NOT EXISTS status_pedido (
  id_status INT AUTO_INCREMENT PRIMARY KEY,
  nome_status VARCHAR(40) NOT NULL UNIQUE,
  descricao VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_veiculo INT NOT NULL,
  id_motorista INT NULL,
  id_status INT NOT NULL,
  endereco_atendimento VARCHAR(255) NOT NULL,
  localizacao VARCHAR(255) NOT NULL,
  tipo_problema VARCHAR(80) NOT NULL,
  descricao_problema TEXT,
  tipo_servico VARCHAR(80) NOT NULL,
  valor_estimado DECIMAL(10,2) NOT NULL,
  data_hora_solicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmado BOOLEAN NOT NULL DEFAULT TRUE,
  observacoes TEXT,
  CONSTRAINT fk_pedidos_clientes
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  CONSTRAINT fk_pedidos_veiculos
    FOREIGN KEY (id_veiculo) REFERENCES veiculos(id_veiculo),
  CONSTRAINT fk_pedidos_motoristas
    FOREIGN KEY (id_motorista) REFERENCES motoristas(id_motorista)
    ON DELETE SET NULL,
  CONSTRAINT fk_pedidos_status
    FOREIGN KEY (id_status) REFERENCES status_pedido(id_status)
);

CREATE INDEX idx_pedidos_data ON pedidos(data_hora_solicitacao);
CREATE INDEX idx_pedidos_status ON pedidos(id_status);
CREATE INDEX idx_pedidos_motorista ON pedidos(id_motorista);
