export class User {
  constructor(id, nome, email, tipo = "PADRAO") {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.tipo = tipo; // 'PADRAO' ou 'PREMIUM'
  }

  isPremium() {
    return this.tipo === "PREMIUM";
  }
}

export class Item {
  constructor(nome, preco) {
    this.nome = nome;
    this.preco = preco;
  }
}

export class Pedido {
  constructor(id, carrinho, totalFinal, status) {
    this.id = id;
    this.carrinho = carrinho;
    this.totalFinal = totalFinal;
    this.status = status; // 'PROCESSADO' ou 'FALHOU'
  }
}

export class Carrinho {
  constructor(user, itens = []) {
    this.user = user;
    this.itens = itens;
  }

  calcularTotal() {
    return this.itens.reduce((total, item) => total + item.preco, 0);
  }
}

export class GatewayPagamento {
  async cobrar(valor, cartao) {
    throw new Error("Não deve chamar o Gateway real");
  }
}

export class EmailService {
  async enviarEmail(para, assunto, corpo) {
    throw new Error("Não deve enviar E-mail real");
  }
}

export class PedidoRepository {
  async salvar(pedido) {
    throw new Error("Não deve salvar no DB real");
  }
}

export class CheckoutService {
  constructor(gateway, repository, emailSvc) {
    this.gatewayPagamento = gateway;
    this.pedidoRepository = repository;
    this.emailService = emailSvc;
  }

  async processarPedido(carrinho, cartaoCredito) {
    const totalInicial = carrinho.calcularTotal();
    let totalFinal = totalInicial;

    if (carrinho.user.isPremium()) {
      totalFinal = totalInicial * 0.9;
    }

    const respostaPgto = await this.gatewayPagamento.cobrar(
      totalFinal,
      cartaoCredito
    );

    if (!respostaPgto.success) {
      return null;
    }

    const pedido = new Pedido(null, carrinho, totalFinal, "PROCESSADO");

    const pedidoSalvo = await this.pedidoRepository.salvar(pedido);

    try {
      await this.emailService.enviarEmail(
        carrinho.user.email,
        "Seu Pedido foi Aprovado!",
        `Pedido ${pedidoSalvo.id} no valor de R$${totalFinal}`
      );
    } catch (e) {
      console.error("Falha ao enviar e-mail", e.message);
    }

    return pedidoSalvo;
  }
}
