import NextCors from 'nextjs-cors';
import bcryptjs from 'bcryptjs'
import apiResponse from "../../../../functions/apiResponse";
import criarSlug from "../../../../functions/criarSlug";
import databaseConnect from "../../../../functions/databaseConnect";
import validaTokens from "../../../../functions/validaTokens";
import Usuario from '../../../../models/usuario';
import replaceAll from '../../../../functions/replaceAll';

export default async function apiPrivadaUsuarioCriar(req, res) {
  if (res !== null) {
    await NextCors(req, res, {
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      origin: '*',
      optionsSuccessStatus: 200,
    });
  }



  if (req?.method === "POST") {
    try {
      let body = req.body;
      let dados = body?.dados;
      let condicoes = body?.condicoes;
      let tokenAmbiente = req.headers.token_ambiente;
      const resValidacao = await validaTokens(tokenAmbiente || true, false);
      try {
        await databaseConnect();
      } catch (error) {
        return apiResponse(res, 400, "ERRO", "Não conseguimos se conectar ao banco de dados, tente novamente mais tarde.", String(error));
      }



      if (resValidacao !== true) {
        throw `Tokens enviados para API são inválidos.`;
      }
      if (!dados.slug) {
        dados.slug = criarSlug(dados.nome);
      }
      if (dados.senha) {
        dados.senha = bcryptjs.hashSync(dados.senha, bcryptjs.genSaltSync(10));
      }

      let resBancoDeDados = await Usuario.create(dados);
      return apiResponse(res, 200, "OK", "Dados criados e listados na resposta.", resBancoDeDados);



    } catch (error) {
      console.error(error);
      if (String(error).includes(`ValidationError:`)) {
        return apiResponse(res, 400, "ERRO", replaceAll((String(error).replace("ValidationError: ", "")), ":", ""), String(error));
      } else {
        return apiResponse(res, 400, "ERRO", "Dados não criados, tivemos um problema tente novamente mais tarde, caso persistir contate nossa equipe de atendimento via email.", String(error));
      }
    }
  } else {
    return apiResponse(res, 404, "ERRO", "404 endpoint não existe.", "");
  }
}
