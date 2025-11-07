import express from "express";
import { authenticateToken } from "./auth.js";
import pool from "./db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Atualizar perfil (diagnóstico e painel genético)
router.put("/perfil", authenticateToken, async (req, res) => {
  try {
    const { diagnostico_previo, painel_genetico } = req.body;
    const userId = req.user.id;

    const [result] = await pool.execute(
      `UPDATE paciente 
       SET diagnostico_previo = ?, painel_genetico = ? 
       WHERE idPaciente = ?`,
      [diagnostico_previo, painel_genetico, userId]
    );

    res.json({ message: 'Perfil atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar família (e automaticamente adiciona o criador)
router.post("/familia", authenticateToken, async (req, res) => {
  try {
    const { nome_familia } = req.body;
    const userId = req.user.id;

    if (!nome_familia) {
      return res.status(400).json({ error: 'Nome da família é obrigatório' });
    }

    // Verifica se usuário já pertence a uma família
    const [userData] = await pool.execute(
      'SELECT idFamilia FROM paciente WHERE idPaciente = ?',
      [userId]
    );

    if (userData[0].idFamilia) {
      return res.status(400).json({ error: 'Você já pertence a uma família' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cria a família
      const [familiaResult] = await connection.execute(
        'INSERT INTO familia (nome_familia, criador_idPaciente) VALUES (?, ?)',
        [nome_familia, userId]
      );

      const familiaId = familiaResult.insertId;

      // Atualiza o paciente para pertencer à família
      await connection.execute(
        'UPDATE paciente SET idFamilia = ? WHERE idPaciente = ?',
        [familiaId, userId]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Família criada com sucesso',
        familia: {
          id: familiaId,
          nome_familia,
          criador_id: userId
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao criar família:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Já existe uma família com este nome' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar membro à família (com email opcional)
router.post("/familia/membros", authenticateToken, async (req, res) => {
  try {
    const { nome, data_nascimento, sexo, email } = req.body;
    const userId = req.user.id;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Verifica se o usuário pertence a uma família
    const [userData] = await pool.execute(
      'SELECT idFamilia FROM paciente WHERE idPaciente = ?',
      [userId]
    );

    const userFamiliaId = userData[0].idFamilia;

    if (!userFamiliaId) {
      return res.status(400).json({ error: 'Você não pertence a nenhuma família' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      let pacienteId;

      if (email) {
        // Verifica se já existe um paciente com este email
        const [existingPatients] = await connection.execute(
          'SELECT idPaciente, idFamilia FROM paciente WHERE email = ?',
          [email]
        );

        if (existingPatients.length > 0) {
          const existingPatient = existingPatients[0];
          
          // Se já pertence a outra família, não pode adicionar
          if (existingPatient.idFamilia && existingPatient.idFamilia !== userFamiliaId) {
            await connection.rollback();
            return res.status(400).json({ error: 'Este usuário já pertence a outra família' });
          }
          
          // Se não pertence a família nenhuma ou já pertence à mesma família
          pacienteId = existingPatient.idPaciente;
          
          // Atualiza para a família atual
          await connection.execute(
            'UPDATE paciente SET idFamilia = ? WHERE idPaciente = ?',
            [userFamiliaId, pacienteId]
          );
        } else {
          // Cria novo paciente com email (sem senha para não poder fazer login)
          const hashedPassword = await bcrypt.hash('', 10); // Senha vazia
          const [pacienteResult] = await connection.execute(
            `INSERT INTO paciente (nome, data_nascimento, sexo, email, senha, idFamilia) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, data_nascimento, sexo, email, hashedPassword, userFamiliaId]
          );
          pacienteId = pacienteResult.insertId;
        }
      } else {
        // Cria paciente sem email (membro falecido, etc.)
        const hashedPassword = await bcrypt.hash('', 10); // Senha vazia
        const [pacienteResult] = await connection.execute(
          `INSERT INTO paciente (nome, data_nascimento, sexo, email, senha, idFamilia) 
           VALUES (?, ?, ?, NULL, ?, ?)`,
          [nome, data_nascimento, sexo, hashedPassword, userFamiliaId]
        );
        pacienteId = pacienteResult.insertId;
      }

      await connection.commit();

      res.status(201).json({
        message: 'Membro adicionado com sucesso',
        membro: { 
          id: pacienteId, 
          nome, 
          data_nascimento, 
          sexo, 
          email,
          idFamilia: userFamiliaId
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter dados da família do usuário
router.get("/minha-familia", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userData] = await pool.execute(
      `SELECT p.idFamilia, f.nome_familia, f.criador_idPaciente
       FROM paciente p
       LEFT JOIN familia f ON p.idFamilia = f.idFamilia
       WHERE p.idPaciente = ?`,
      [userId]
    );

    if (!userData[0].idFamilia) {
      return res.json({ familia: null });
    }

    // Busca todos os membros da família
    const [membros] = await pool.execute(
      `SELECT idPaciente, nome, data_nascimento, sexo, email, 
              diagnostico_previo, painel_genetico
       FROM paciente 
       WHERE idFamilia = ?`,
      [userData[0].idFamilia]
    );

    res.json({
      familia: {
        id: userData[0].idFamilia,
        nome_familia: userData[0].nome_familia,
        criador_id: userData[0].criador_idPaciente,
        membros: membros
      }
    });

  } catch (error) {
    console.error('Erro ao buscar família:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Sair da família (remove o usuário da família)
router.delete("/familia/sair", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      'UPDATE paciente SET idFamilia = NULL WHERE idPaciente = ?',
      [userId]
    );

    res.json({ message: 'Você saiu da família com sucesso' });

  } catch (error) {
    console.error('Erro ao sair da família:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;