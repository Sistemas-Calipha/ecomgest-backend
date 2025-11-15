import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // usamos la clave pública o service key
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log("🚀 Probando inserción de roles y usuarios...");

  try {
    // 1️⃣ Insertar un rol de ejemplo
    const { data: rolData, error: rolError } = await supabase
      .from('roles')
      .insert([{ nombre: 'Administrador', descripcion: 'Acceso total al sistema' }])
      .select();

    if (rolError) throw rolError;
    const rolId = rolData[0].id;
    console.log('✅ Rol insertado:', rolData);

    // 2️⃣ Insertar un usuario vinculado al rol
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre_completo: 'Erick Calipha',
          correo: 'erick@calipha.com',
          contrasena: '123456',
          rol_id: rolId,
          activo: true
        }
      ])
      .select(`
        id, nombre_completo, correo, activo, roles(nombre)
      `);

    if (userError) throw userError;
    console.log('✅ Usuario insertado:', userData);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
