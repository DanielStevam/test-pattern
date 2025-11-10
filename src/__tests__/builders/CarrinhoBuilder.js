import { Carrinho, Item } from "../../domain/User.js";
import UserMother from "./UserMother.js";

export default class CarrinhoBuilder {
  constructor() {
    this._user = UserMother.umUsuarioPadrao();
    this._itens = [new Item("Item Base", 200)];
  }

  vazio() {
    this._itens = [];
    return this;
  }

  comUser(user) {
    this._user = user;
    return this;
  }

  comTotal(valor) {
    this._itens = [new Item("Item", valor)];
    return this;
  }

  build() {
    return new Carrinho(this._user, this._itens);
  }
}
