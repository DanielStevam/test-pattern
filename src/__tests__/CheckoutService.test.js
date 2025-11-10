import CarrinhoBuilder from "./builders/CarrinhoBuilder.js";
import UserMother from "./builders/UserMother.js";
import { CheckoutService } from "../domain/User.js";

describe("CheckoutService — Test Patterns", () => {
  describe("falha no pagamento (Stub + State Verification)", () => {
    test("deve retornar null e não enviar email", async () => {
      const carrinho = new CarrinhoBuilder().comTotal(200).build();

      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: false }),
      };
      const emailMock = { enviarEmail: jest.fn() };
      const pedidoRepoStub = { salvar: jest.fn() };

      const checkoutService = new CheckoutService(
        gatewayStub,
        pedidoRepoStub,
        emailMock
      );
      const pedido = await checkoutService.processarPedido(carrinho, {
        numero: "1234-5678",
      });

      expect(pedido).toBeNull();
      expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
      expect(emailMock.enviarEmail).not.toHaveBeenCalled();
      expect(pedidoRepoStub.salvar).not.toHaveBeenCalled();
    });
  });

  describe("cliente Premium (Mock + Behavior Verification)", () => {
    test("deve aplicar 10% de desconto, cobrar 180 e enviar email", async () => {
      const userPremium = UserMother.umUsuarioPremium();
      const carrinho = new CarrinhoBuilder()
        .comUser(userPremium)
        .comTotal(200)
        .build();

      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: true }),
      };
      const pedidoRepoStub = {
        salvar: jest.fn().mockImplementation(async (pedido) => ({
          ...pedido,
          id: "p-123",
          status: "PROCESSADO",
        })),
      };
      const emailMock = { enviarEmail: jest.fn().mockResolvedValue(true) };

      const checkoutService = new CheckoutService(
        gatewayStub,
        pedidoRepoStub,
        emailMock
      );

      const pedido = await checkoutService.processarPedido(carrinho, {
        numero: "1234-5678",
      });

      expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, expect.any(Object));
      expect(emailMock.enviarEmail).toHaveBeenCalledWith(
        "premium@email.com",
        "Seu Pedido foi Aprovado!",
        expect.any(String)
      );
      expect(pedido.status).toBe("PROCESSADO");
    });
  });
});
