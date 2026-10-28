const connection = require("../database/connection")
const { search } = require("../routes/filmeRoutes")

const FilmeModel = {
    async findAll() {
        // return await connection.raw("SELECT * FROM filmes")

        return await connection("filmes")
    },

    async create(filme, generos) {
        const { titulo, diretorId } = filme

        const insereFilme = await connection("filmes").insert({
            titulo,
            diretor_Id: diretorId
        })

        const filmeId = insereFilme

        //console.log(insereFilme)

        // inserir um relacionamento para o novo filme para cada genero
        if (generos && generos.length > 0) {
            for (const generoId of generos) {
                await connection("filmes_generos").insert({
                    filme_id: filmeId,
                    genero_id: generoId
                })
            }
        }

        return filmeId
    },

    async findById(id) {
        /*const filmeResult = await connection.raw(
            "SELECT * FROM filmes WHERE id = ?",
            [ id ]
        )*/

        const filme = await connection("filmes")
            .where({ id })
            .first()
        if (!filme) return null

        //const generos = await connection.raw(`
        //  SELECT g.id, g.nome FROM generos g
        //JOIN filmes_generos fg ON g.id = fg.genero_id
        //WHERE fg.filme_id = ?    
        //`,
        //[ id ]
        //)

        const generos = await connection("generos")
            .join("filmes_generos", "generos.id", "filmes_generos.genero_id")
            .where("filmes_generos.filme_id", id)
            .select("generos.id", "generos.nome")


        return {
            ...filme,
            generos
        }
    },

    async search(filtros) {
        const { titulo, diretor, genero, } = filtros

        let query = connection("filmes")
            .leftJoin("filmes_generos", "filme.id", "filmes_generos.filme_id")
            .leftJoin("generos", "generos.id", "filmes_generos.filme_id")
            .select("filmes.id",
                "filmes.titulo",
                "filmes.diretor_id")
            .distinct()

        if (titulo) {
            query = query.where("filmes.titulo", "like", `%${avaliado}%`)
        }

        if (genero) {
            query = query.where("filmes.generos.id", genero)
        }

        if (diretor) {
            query = query.where("filmes.diretor_id", diretor)
        }

        return await query
    }
}

module.exports = FilmeModel