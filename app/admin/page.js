'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  Clock3,
  ExternalLink,
  Eye,
  LogOut,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

const ADMIN_UID =
  'd8a08746-ce14-407a-80e5-fc9e1a0340aa';

export default function AdminPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [propiedades, setPropiedades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingPropiedades, setLoadingPropiedades] =
    useState(true);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [filtro, setFiltro] = useState('pendiente');
  const [busqueda, setBusqueda] = useState('');

  const [accionandoId, setAccionandoId] =
    useState(null);

  useEffect(() => {
    comprobarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          router.replace('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function comprobarSesion() {
    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      router.replace('/login');
      return;
    }

    if (session.user.id !== ADMIN_UID) {
      await supabase.auth.signOut();
      router.replace('/login');
      return;
    }

    setUsuario(session.user);

    await cargarPropiedades();

    setLoading(false);
  }

  async function cargarPropiedades() {
    setLoadingPropiedades(true);
    setError('');

    const { data, error } = await supabase
      .from('propiedades')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Error cargando propiedades:',
        error
      );

      setError(
        'No fue posible cargar las propiedades.'
      );

      setLoadingPropiedades(false);
      return;
    }

    setPropiedades(data || []);
    setLoadingPropiedades(false);
  }

  async function cambiarEstado(
    id,
    nuevoEstado
  ) {
    setAccionandoId(id);
    setError('');
    setMensaje('');

    const actualizacion = {
      estado: nuevoEstado,
      publicada:
        nuevoEstado === 'publicada',
    };

    const { error } = await supabase
      .from('propiedades')
      .update(actualizacion)
      .eq('id', id);

    if (error) {
      console.error(error);

      setError(
        'No fue posible actualizar la propiedad.'
      );

      setAccionandoId(null);
      return;
    }

    setPropiedades((actuales) =>
      actuales.map((propiedad) =>
        propiedad.id === id
          ? {
              ...propiedad,
              ...actualizacion,
            }
          : propiedad
      )
    );

    if (nuevoEstado === 'publicada') {
      setMensaje(
        'Propiedad publicada correctamente.'
      );
    }

    if (nuevoEstado === 'rechazada') {
      setMensaje(
        'Propiedad rechazada correctamente.'
      );
    }

    setAccionandoId(null);
  }

  async function eliminarPropiedad(
    propiedad
  ) {
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar "${propiedad.titulo}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmado) {
      return;
    }

    setAccionandoId(propiedad.id);
    setError('');
    setMensaje('');

    const { error } = await supabase
      .from('propiedades')
      .delete()
      .eq('id', propiedad.id);

    if (error) {
      console.error(error);

      setError(
        'No fue posible eliminar la propiedad.'
      );

      setAccionandoId(null);
      return;
    }

    setPropiedades((actuales) =>
      actuales.filter(
        (item) =>
          item.id !== propiedad.id
      )
    );

    setMensaje(
      'Propiedad eliminada correctamente.'
    );

    setAccionandoId(null);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const totales = useMemo(() => {
    return {
      todas: propiedades.length,

      pendientes: propiedades.filter(
        (p) =>
          p.estado === 'pendiente'
      ).length,

      publicadas: propiedades.filter(
        (p) =>
          p.estado === 'publicada'
      ).length,

      rechazadas: propiedades.filter(
        (p) =>
          p.estado === 'rechazada'
      ).length,
    };
  }, [propiedades]);

  const propiedadesFiltradas =
    useMemo(() => {
      let resultado = [...propiedades];

      if (filtro !== 'todas') {
        resultado = resultado.filter(
          (propiedad) =>
            propiedad.estado === filtro
        );
      }

      const texto = busqueda
        .trim()
        .toLowerCase();

      if (texto) {
        resultado = resultado.filter(
          (propiedad) => {
            const contenido = [
              propiedad.titulo,
              propiedad.comuna,
              propiedad.region,
              propiedad.tipo,
              propiedad.nombre_contacto,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();

            return contenido.includes(
              texto
            );
          }
        );
      }

      return resultado;
    }, [
      propiedades,
      filtro,
      busqueda,
    ]);

  if (loading) {
    return (
      <main className="loading-page">
        <div className="spinner" />
        <p>Verificando acceso...</p>

        <Styles />
      </main>
    );
  }

  return (
    <main className="admin-page">

      <aside className="sidebar">

        <div>
          <a
            href="/"
            className="logo"
          >
            HECTA
          </a>

          <span className="admin-label">
            ADMINISTRACIÓN
          </span>
        </div>

        <nav>

          <button
            className={
              filtro === 'pendiente'
                ? 'active'
                : ''
            }
            onClick={() =>
              setFiltro('pendiente')
            }
          >
            <Clock3 size={18} />
            Pendientes

            <span>
              {totales.pendientes}
            </span>
          </button>

          <button
            className={
              filtro === 'publicada'
                ? 'active'
                : ''
            }
            onClick={() =>
              setFiltro('publicada')
            }
          >
            <Check size={18} />
            Publicadas

            <span>
              {totales.publicadas}
            </span>
          </button>

          <button
            className={
              filtro === 'rechazada'
                ? 'active'
                : ''
            }
            onClick={() =>
              setFiltro('rechazada')
            }
          >
            <X size={18} />
            Rechazadas

            <span>
              {totales.rechazadas}
            </span>
          </button>

          <button
            className={
              filtro === 'todas'
                ? 'active'
                : ''
            }
            onClick={() =>
              setFiltro('todas')
            }
          >
            <Eye size={18} />
            Todas

            <span>
              {totales.todas}
            </span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-info">
            <span>
              Administrador
            </span>

            <strong>
              {usuario?.email}
            </strong>
          </div>

          <button
            className="logout"
            onClick={cerrarSesion}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>

        </div>

      </aside>

      <section className="content">

        <header className="header">

          <div>
            <span className="eyebrow">
              PANEL DE CONTROL
            </span>

            <h1>
              Propiedades
            </h1>

            <p>
              Revisa y administra las
              publicaciones enviadas a
              Hecta.
            </p>
          </div>

          <div className="header-actions">

            <a
              href="/"
              target="_blank"
              className="view-site"
            >
              Ver hecta.cl
              <ArrowUpRight size={18} />
            </a>

            <button
              className="refresh"
              onClick={
                cargarPropiedades
              }
              disabled={
                loadingPropiedades
              }
            >
              <RefreshCw
                size={18}
                className={
                  loadingPropiedades
                    ? 'rotating'
                    : ''
                }
              />

              Actualizar
            </button>

          </div>

        </header>

        <section className="stats">

          <Stat
            label="Pendientes"
            value={
              totales.pendientes
            }
          />

          <Stat
            label="Publicadas"
            value={
              totales.publicadas
            }
          />

          <Stat
            label="Rechazadas"
            value={
              totales.rechazadas
            }
          />

          <Stat
            label="Total"
            value={totales.todas}
          />

        </section>

        <section className="toolbar">

          <div className="search-box">

            <Search size={19} />

            <input
              value={busqueda}
              onChange={(event) =>
                setBusqueda(
                  event.target.value
                )
              }
              placeholder="Buscar por título, comuna, región..."
            />

          </div>

          <span className="results-count">
            {
              propiedadesFiltradas.length
            }{' '}
            {
              propiedadesFiltradas.length ===
              1
                ? 'propiedad'
                : 'propiedades'
            }
          </span>

        </section>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="alert success">
            {mensaje}
          </div>
        )}

        {loadingPropiedades ? (
          <div className="empty">
            Cargando propiedades...
          </div>
        ) : propiedadesFiltradas.length ===
          0 ? (
          <div className="empty">

            <h2>
              No hay propiedades aquí
            </h2>

            <p>
              No encontramos publicaciones
              con estos filtros.
            </p>

          </div>
        ) : (
          <div className="properties">

            {propiedadesFiltradas.map(
              (propiedad) => (
                <PropertyRow
                  key={
                    propiedad.id
                  }
                  propiedad={
                    propiedad
                  }
                  accionando={
                    accionandoId ===
                    propiedad.id
                  }
                  onPublicar={() =>
                    cambiarEstado(
                      propiedad.id,
                      'publicada'
                    )
                  }
                  onRechazar={() =>
                    cambiarEstado(
                      propiedad.id,
                      'rechazada'
                    )
                  }
                  onEliminar={() =>
                    eliminarPropiedad(
                      propiedad
                    )
                  }
                />
              )
            )}

          </div>
        )}

      </section>

      <Styles />

    </main>
  );
}

function PropertyRow({
  propiedad,
  accionando,
  onPublicar,
  onRechazar,
  onEliminar,
}) {
  const imagen =
    Array.isArray(
      propiedad.imagenes
    ) &&
    propiedad.imagenes.length > 0
      ? propiedad.imagenes[0]
      : null;

  const precio =
    propiedad.precio !== null &&
    propiedad.precio !== undefined
      ? propiedad.moneda === 'UF'
        ? `${Number(
            propiedad.precio
          ).toLocaleString(
            'es-CL'
          )} UF`
        : `$${Number(
            propiedad.precio
          ).toLocaleString(
            'es-CL'
          )}`
      : 'Precio a consultar';

  const ubicacion = [
    propiedad.comuna,
    propiedad.region,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="property-row">

      <div className="property-image">

        {imagen ? (
          <img
            src={imagen}
            alt={
              propiedad.titulo
            }
          />
        ) : (
          <span>
            Sin foto
          </span>
        )}

      </div>

      <div className="property-info">

        <div className="top-line">

          <StatusBadge
            estado={
              propiedad.estado
            }
          />

          <span className="date">
            {formatearFecha(
              propiedad.created_at
            )}
          </span>

        </div>

        <h2>
          {propiedad.titulo}
        </h2>

        <p className="location">
          {ubicacion ||
            'Ubicación por confirmar'}
        </p>

        <div className="meta">

          {propiedad.tipo && (
            <span>
              {propiedad.tipo}
            </span>
          )}

          {propiedad.superficie_total && (
            <span>
              {Number(
                propiedad.superficie_total
              ).toLocaleString(
                'es-CL'
              )}{' '}
              {propiedad.unidad_superficie ===
              'm2'
                ? 'm²'
                : propiedad.unidad_superficie}
            </span>
          )}

        </div>

        <strong className="price">
          {precio}
        </strong>

        {propiedad.nombre_contacto && (
          <p className="contact">
            Contacto:{' '}

            <strong>
              {
                propiedad.nombre_contacto
              }
            </strong>

            {
              propiedad.telefono_contacto &&
              ` · ${propiedad.telefono_contacto}`
            }
          </p>
        )}

      </div>

      <div className="property-actions">

        {propiedad.estado ===
          'pendiente' && (
          <>
            <button
              className="publish"
              onClick={onPublicar}
              disabled={accionando}
            >
              <Check size={18} />
              Publicar
            </button>

            <button
              className="reject"
              onClick={onRechazar}
              disabled={accionando}
            >
              <X size={18} />
              Rechazar
            </button>
          </>
        )}

        {propiedad.estado ===
          'rechazada' && (
          <button
            className="publish"
            onClick={onPublicar}
            disabled={accionando}
          >
            <Check size={18} />
            Publicar
          </button>
        )}

        {propiedad.estado ===
          'publicada' && (
          <a
            href={`/propiedad/${propiedad.id}`}
            target="_blank"
            rel="noreferrer"
            className="open"
          >
            <ExternalLink size={18} />
            Ver publicación
          </a>
        )}

        <a
          href={`/admin/editar/${propiedad.id}`}
          className="edit"
        >
          <Pencil size={18} />
          Editar
        </a>

        <button
          className="delete"
          onClick={onEliminar}
          disabled={accionando}
        >
          <Trash2 size={18} />
          Eliminar
        </button>

      </div>

    </article>
  );
}

function Stat({
  label,
  value,
}) {
  return (
    <div className="stat">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function StatusBadge({
  estado,
}) {
  let texto =
    'Pendiente';

  if (
    estado === 'publicada'
  ) {
    texto =
      'Publicada';
  }

  if (
    estado === 'rechazada'
  ) {
    texto =
      'Rechazada';
  }

  return (
    <span
      className={`status ${estado}`}
    >
      {texto}
    </span>
  );
}

function formatearFecha(
  fecha
) {
  if (!fecha) {
    return '';
  }

  try {
    return new Date(
      fecha
    ).toLocaleDateString(
      'es-CL',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  } catch {
    return '';
  }
}

function Styles() {
  return (
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      button,
      input {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      .loading-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 14px;
        background: #f4f2ec;
        color: #52625a;
      }

      .spinner {
        width: 36px;
        height: 36px;
        border: 4px solid #dcd9d0;
        border-top-color: #0b5137;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .admin-page {
        min-height: 100vh;
        display: grid;
        grid-template-columns:
          260px
          minmax(0, 1fr);
        background: #f5f3ed;
        color: #102335;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
      }

      .sidebar {
        position: sticky;
        top: 0;
        height: 100vh;
        padding: 30px 22px;
        display: flex;
        flex-direction: column;
        background: #083f2d;
        color: white;
      }

      .logo {
        display: block;
        color: white;
        font-size: 25px;
        font-weight: 900;
        letter-spacing: 0.2em;
        text-decoration: none;
      }

      .admin-label {
        display: block;
        margin-top: 7px;
        color: #dab45e;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.14em;
      }

      .sidebar nav {
        display: grid;
        gap: 7px;
        margin-top: 45px;
      }

      .sidebar nav button {
        width: 100%;
        min-height: 48px;
        display: grid;
        grid-template-columns:
          23px
          minmax(0, 1fr)
          auto;
        align-items: center;
        gap: 10px;
        padding: 0 13px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(
          255,
          255,
          255,
          0.78
        );
        text-align: left;
        font-weight: 750;
      }

      .sidebar nav button span {
        min-width: 25px;
        padding: 3px 7px;
        border-radius: 20px;
        background: rgba(
          255,
          255,
          255,
          0.12
        );
        text-align: center;
        font-size: 12px;
      }

      .sidebar nav button:hover,
      .sidebar nav button.active {
        background: rgba(
          255,
          255,
          255,
          0.11
        );
        color: white;
      }

      .sidebar-bottom {
        margin-top: auto;
        display: grid;
        gap: 18px;
      }

      .user-info {
        display: grid;
        gap: 4px;
      }

      .user-info span {
        color: rgba(
          255,
          255,
          255,
          0.55
        );
        font-size: 11px;
      }

      .user-info strong {
        overflow: hidden;
        color: rgba(
          255,
          255,
          255,
          0.88
        );
        font-size: 12px;
        text-overflow: ellipsis;
      }

      .logout {
        min-height: 43px;
        display: flex;
        align-items: center;
        gap: 9px;
        border: 1px solid
          rgba(
            255,
            255,
            255,
            0.18
          );
        border-radius: 10px;
        padding: 0 12px;
        background: transparent;
        color: white;
        font-weight: 750;
      }

      .content {
        width: 100%;
        max-width: 1450px;
        margin: 0 auto;
        padding: 42px;
      }

      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 30px;
        margin-bottom: 30px;
      }

      .eyebrow {
        color: #aa8438;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.12em;
      }

      .header h1 {
        margin: 6px 0 6px;
        color: #0b412e;
        font-size: 42px;
        line-height: 1;
      }

      .header p {
        margin: 0;
        color: #68736d;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }

      .view-site,
      .refresh {
        min-height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border-radius: 10px;
        padding: 0 15px;
        font-weight: 800;
        text-decoration: none;
      }

      .view-site {
        border: 1px solid #d7d3ca;
        background: white;
        color: #16382c;
      }

      .refresh {
        border: 0;
        background: #0b5137;
        color: white;
      }

      .rotating {
        animation:
          spin 0.9s
          linear
          infinite;
      }

      .stats {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 22px;
      }

      .stat {
        display: grid;
        gap: 5px;
        padding: 20px;
        border: 1px solid #dfdbd1;
        border-radius: 15px;
        background: white;
      }

      .stat span {
        color: #778079;
        font-size: 13px;
        font-weight: 700;
      }

      .stat strong {
        color: #0b5137;
        font-size: 30px;
      }

      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 19px;
      }

      .search-box {
        width: 100%;
        max-width: 520px;
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 14px;
        border: 1px solid #dad6cc;
        border-radius: 11px;
        background: white;
        color: #747d78;
      }

      .search-box input {
        width: 100%;
        border: 0;
        outline: 0;
        background: transparent;
        color: #102335;
      }

      .results-count {
        color: #737d77;
        font-size: 13px;
        font-weight: 700;
      }

      .alert {
        margin-bottom: 18px;
        padding: 13px 15px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 750;
      }

      .alert.error {
        background: #fff0ef;
        color: #a72a25;
      }

      .alert.success {
        background: #e9f6ef;
        color: #11613f;
      }

      .properties {
        display: grid;
        gap: 13px;
      }

      .property-row {
        display: grid;
        grid-template-columns:
          190px
          minmax(0, 1fr)
          190px;
        gap: 20px;
        padding: 15px;
        border: 1px solid #dedad0;
        border-radius: 17px;
        background: white;
      }

      .property-image {
        height: 160px;
        overflow: hidden;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: #ece9e1;
        color: #818983;
        font-size: 13px;
      }

      .property-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .property-info {
        min-width: 0;
        padding: 3px 0;
      }

      .top-line {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 7px;
      }

      .status {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 0 9px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 850;
      }

      .status.pendiente {
        background: #fff4d8;
        color: #8b691f;
      }

      .status.publicada {
        background: #e5f5eb;
        color: #0b6b40;
      }

      .status.rechazada {
        background: #fae8e7;
        color: #a12e29;
      }

      .date {
        color: #8a928e;
        font-size: 11px;
      }

      .property-info h2 {
        margin: 0 0 4px;
        color: #153429;
        font-size: 19px;
      }

      .location {
        margin: 0 0 10px;
        color: #707a74;
        font-size: 14px;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-bottom: 9px;
      }

      .meta span {
        padding: 5px 9px;
        border: 1px solid #e2ded5;
        border-radius: 20px;
        color: #69736d;
        font-size: 11px;
      }

      .price {
        display: block;
        color: #0b5137;
        font-size: 18px;
      }

      .contact {
        margin: 9px 0 0;
        color: #77807b;
        font-size: 11px;
      }

      .property-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }

      .property-actions button,
      .property-actions a {
        min-height: 41px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border-radius: 9px;
        padding: 0 10px;
        font-weight: 800;
        font-size: 13px;
        text-decoration: none;
      }

      .publish {
        border: 0;
        background: #0b5137;
        color: white;
      }

      .reject {
        border: 1px solid #dedbd2;
        background: white;
        color: #8d302c;
      }

      .open {
        border: 1px solid #d8d5cc;
        background: white;
        color: #0b5137;
      }

      .edit {
        border: 1px solid #c8d7cf;
        background: #f1f7f3;
        color: #0b5137;
      }

      .delete {
        border: 0;
        background: transparent;
        color: #a6443e;
      }

      .property-actions
        button:disabled {
        opacity: 0.55;
        cursor: wait;
      }

      .empty {
        padding: 70px 30px;
        border: 1px dashed #d8d4ca;
        border-radius: 16px;
        background: rgba(
          255,
          255,
          255,
          0.55
        );
        text-align: center;
        color: #68736d;
      }

      .empty h2 {
        margin: 0 0 6px;
        color: #15382b;
      }

      .empty p {
        margin: 0;
      }

      @media (
        max-width: 1050px
      ) {
        .admin-page {
          grid-template-columns:
            210px
            minmax(0, 1fr);
        }

        .content {
          padding: 30px 24px;
        }

        .property-row {
          grid-template-columns:
            150px
            minmax(0, 1fr);
        }

        .property-actions {
          grid-column:
            1 / -1;
          flex-direction: row;
          justify-content: flex-end;
        }
      }

      @media (
        max-width: 760px
      ) {
        .admin-page {
          display: block;
        }

        .sidebar {
          position: static;
          width: 100%;
          height: auto;
        }

        .sidebar nav {
          margin-top: 25px;
        }

        .sidebar-bottom {
          margin-top: 25px;
        }

        .content {
          padding:
            25px
            14px
            60px;
        }

        .header {
          flex-direction: column;
        }

        .stats {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .toolbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .property-row {
          grid-template-columns: 1fr;
        }

        .property-image {
          height: 220px;
        }

        .property-actions {
          grid-column: auto;
          flex-direction: column;
        }
      }
    `}</style>
  );
}