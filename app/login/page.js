'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, LogIn } from 'lucide-react';

import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function iniciarSesion(event) {
    event.preventDefault();

    setLoading(true);
    setError('');

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      console.error(error);

      setError(
        'Correo o contraseña incorrectos.'
      );

      setLoading(false);
      return;
    }

    router.push('/admin');
  }

  return (
    <main className="login-page">
      <div className="login-card">

        <a
          href="/"
          className="brand"
        >
          HECTA
        </a>

        <div className="heading">
          <span>ADMINISTRACIÓN</span>

          <h1>
            Iniciar sesión
          </h1>

          <p>
            Accede al panel privado para revisar
            y administrar las propiedades de Hecta.
          </p>
        </div>

        <form onSubmit={iniciarSesion}>

          <label>
            Correo electrónico

            <div className="input-wrapper">
              <Mail size={19} />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="correo@hecta.cl"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label>
            Contraseña

            <div className="input-wrapper">
              <LockKeyhole size={19} />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            <LogIn size={20} />

            {loading
              ? 'Ingresando...'
              : 'Entrar al panel'}
          </button>

        </form>

        <a
          href="/"
          className="back"
        >
          ← Volver a hecta.cl
        </a>

      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .login-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px 18px;
          background:
            linear-gradient(
              rgba(246, 244, 238, 0.94),
              rgba(246, 244, 238, 0.94)
            ),
            url(
              'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85'
            )
              center / cover;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            sans-serif;
          color: #102335;
        }

        .login-card {
          width: 100%;
          max-width: 470px;
          padding: 38px;
          border-radius: 24px;
          background: rgba(
            255,
            255,
            255,
            0.97
          );
          border: 1px solid #ddd8cc;
          box-shadow:
            0 25px 70px
            rgba(17, 53, 38, 0.13);
        }

        .brand {
          display: inline-block;
          margin-bottom: 34px;
          color: #0b5137;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-decoration: none;
        }

        .heading span {
          color: #aa8438;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .heading h1 {
          margin: 8px 0 10px;
          color: #0b402d;
          font-size: 39px;
          line-height: 1.05;
        }

        .heading p {
          margin: 0 0 28px;
          color: #65716b;
          line-height: 1.6;
        }

        form {
          display: grid;
          gap: 19px;
        }

        label {
          display: grid;
          gap: 8px;
          color: #16372b;
          font-size: 14px;
          font-weight: 800;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 54px;
          padding: 0 15px;
          border: 1px solid #d8d5cc;
          border-radius: 12px;
          background: #fff;
          color: #66736c;
        }

        .input-wrapper:focus-within {
          border-color: #0b5137;
          box-shadow:
            0 0 0 3px
            rgba(11, 81, 55, 0.08);
        }

        input {
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: #102335;
          font: inherit;
        }

        input::placeholder {
          color: #9a9f9b;
        }

        .error {
          padding: 12px 14px;
          border-radius: 10px;
          background: #fff0ef;
          color: #a3241f;
          font-size: 14px;
          font-weight: 700;
        }

        button {
          min-height: 54px;
          border: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 18px;
          background: #0b5137;
          color: #fff;
          font: inherit;
          font-weight: 850;
          cursor: pointer;
        }

        button:hover {
          background: #08452f;
        }

        button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .back {
          display: block;
          margin-top: 25px;
          text-align: center;
          color: #64716a;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        .back:hover {
          color: #0b5137;
        }

        @media (max-width: 520px) {
          .login-card {
            padding: 28px 21px;
          }

          .heading h1 {
            font-size: 34px;
          }
        }
      `}</style>
    </main>
  );
}