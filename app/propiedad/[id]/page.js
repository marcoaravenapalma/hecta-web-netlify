'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function PropiedadPage() {
  const params = useParams();
  const id = params?.id;

  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    async function cargarPropiedad() {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('propiedades')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
        setError('No fue posible cargar esta propiedad.');
        setLoading(false);
        return;
      }

      setPropiedad(data);
      setLoading(false);
    }

    cargarPropiedad();
  }, [id]);

  if (loading) {
    return (
      <main style={styles.page}>
        <p>Cargando propiedad...</p>
      </main>
    );
  }

  if (error || !propiedad) {
    return (
      <main style={styles.page}>
        <a href="/" style={styles.back}>
          ← Volver al inicio
        </a>

        <h1>Propiedad no encontrada</h1>
        <p>{error}</p>
      </main>
    );
  }

  const imagenes =
    Array.isArray(propiedad.imagenes) && propiedad.imagenes.length > 0
      ? propiedad.imagenes
      : [];

  const precio =
    propiedad.moneda === 'UF'
      ? `${Number(propiedad.precio || 0).toLocaleString('es-CL')} UF`
      : `$${Number(propiedad.precio || 0).toLocaleString('es-CL')}`;

  const superficie = propiedad.superficie_total
    ? `${Number(propiedad.superficie_total).toLocaleString('es-CL')} ${
        propiedad.unidad_superficie === 'm2'
          ? 'm²'
          : propiedad.unidad_superficie
      }`
    : null;

  const whatsapp = propiedad.telefono_contacto
    ? `https://wa.me/${propiedad.telefono_contacto.replace(/\D/g, '')}`
    : null;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <a href="/" style={styles.back}>
          ← Volver a propiedades
        </a>

        <section style={styles.header}>
          <div>
            <p style={styles.operation}>
              {propiedad.operacion || 'Venta'}
            </p>

            <h1 style={styles.title}>
              {propiedad.titulo}
            </h1>

            <p style={styles.location}>
              {[propiedad.comuna, propiedad.region]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>

          <div style={styles.price}>
            {precio}
          </div>
        </section>

        <section style={styles.gallery}>
          {imagenes.length > 0 ? (
            <>
              <img
                src={imagenes[0]}
                alt={propiedad.titulo}
                style={styles.mainImage}
              />

              {imagenes.length > 1 && (
                <div style={styles.thumbGrid}>
                  {imagenes.slice(1, 5).map((imagen, index) => (
                    <img
                      key={index}
                      src={imagen}
                      alt={`${propiedad.titulo} ${index + 2}`}
                      style={styles.thumb}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.noImage}>
              Sin fotografías
            </div>
          )}
        </section>

        <div style={styles.columns}>
          <section style={styles.mainContent}>
            <div style={styles.card}>
              <h2>Descripción</h2>

              <p style={styles.description}>
                {propiedad.descripcion || 'Sin descripción disponible.'}
              </p>
            </div>

            <div style={styles.card}>
              <h2>Características</h2>

              <div style={styles.features}>
                {superficie && (
                  <Feature
                    label="Superficie"
                    value={superficie}
                  />
                )}

                {propiedad.tipo && (
                  <Feature
                    label="Tipo"
                    value={propiedad.tipo}
                  />
                )}

                {propiedad.dormitorios != null && (
                  <Feature
                    label="Dormitorios"
                    value={propiedad.dormitorios}
                  />
                )}

                {propiedad.banos != null && (
                  <Feature
                    label="Baños"
                    value={propiedad.banos}
                  />
                )}

                {propiedad.estacionamientos != null && (
                  <Feature
                    label="Estacionamientos"
                    value={propiedad.estacionamientos}
                  />
                )}

                {propiedad.bodegas != null && (
                  <Feature
                    label="Bodegas"
                    value={propiedad.bodegas}
                  />
                )}

                <Feature
                  label="Agua"
                  value={formatFactibilidad(
                    propiedad.factibilidad_agua
                  )}
                />

                <Feature
                  label="Electricidad"
                  value={formatFactibilidad(
                    propiedad.factibilidad_luz
                  )}
                />
              </div>
            </div>

            {propiedad.direccion && (
              <div style={styles.card}>
                <h2>Ubicación</h2>
                <p>{propiedad.direccion}</p>
              </div>
            )}

            {propiedad.video_youtube && (
              <div style={styles.card}>
                <h2>Video</h2>

                <a
                  href={propiedad.video_youtube}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver video en YouTube
                </a>
              </div>
            )}
          </section>

          <aside style={styles.sidebar}>
            <div style={styles.contactCard}>
              <h2>¿Te interesa esta propiedad?</h2>

              <p>
                Contáctanos para más información o coordinar una visita.
              </p>

              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.whatsapp}
                >
                  Consultar por WhatsApp
                </a>
              )}

              {propiedad.telefono_contacto && (
                <a
                  href={`tel:${propiedad.telefono_contacto}`}
                  style={styles.secondary}
                >
                  Llamar
                </a>
              )}

              {propiedad.email_contacto && (
                <a
                  href={`mailto:${propiedad.email_contacto}`}
                  style={styles.secondary}
                >
                  Enviar correo
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Feature({ label, value }) {
  return (
    <div style={styles.feature}>
      <span style={styles.featureLabel}>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function formatFactibilidad(valor) {
  if (valor === 'si') return 'Sí';
  if (valor === 'no') return 'No';
  return 'Por confirmar';
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f6f4ee',
    color: '#102335',
    padding: '30px 20px 80px',
  },

  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },

  back: {
    display: 'inline-block',
    marginBottom: 24,
    color: '#0c5138',
    fontWeight: 700,
    textDecoration: 'none',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 30,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: 28,
  },

  operation: {
    margin: 0,
    color: '#aa8438',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '.08em',
  },

  title: {
    margin: '8px 0',
    fontSize: 'clamp(34px,5vw,58px)',
    lineHeight: 1.05,
    color: '#0b3c2a',
  },

  location: {
    margin: 0,
    color: '#67716c',
    fontSize: 18,
  },

  price: {
    fontSize: 34,
    fontWeight: 900,
    color: '#0b5137',
  },

  gallery: {
    marginBottom: 34,
  },

  mainImage: {
    width: '100%',
    height: 520,
    objectFit: 'cover',
    borderRadius: 22,
    display: 'block',
  },

  thumbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginTop: 12,
  },

  thumb: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    borderRadius: 14,
  },

  noImage: {
    height: 350,
    display: 'grid',
    placeItems: 'center',
    background: '#e8e5dd',
    borderRadius: 22,
    color: '#66716b',
  },

  columns: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
    gap: 28,
    alignItems: 'start',
  },

  mainContent: {
    display: 'grid',
    gap: 20,
  },

  card: {
    background: '#fff',
    border: '1px solid #dedbd1',
    borderRadius: 18,
    padding: 26,
  },

  description: {
    lineHeight: 1.75,
    color: '#445049',
    whiteSpace: 'pre-line',
  },

  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
    gap: 14,
  },

  feature: {
    padding: 16,
    background: '#f7f6f1',
    borderRadius: 12,
    display: 'grid',
    gap: 6,
  },

  featureLabel: {
    fontSize: 13,
    color: '#6b756f',
  },

  sidebar: {
    position: 'sticky',
    top: 24,
  },

  contactCard: {
    background: '#0b5137',
    color: '#fff',
    borderRadius: 20,
    padding: 26,
    display: 'grid',
    gap: 14,
  },

  whatsapp: {
    display: 'block',
    textAlign: 'center',
    background: '#fff',
    color: '#0b5137',
    padding: '14px 18px',
    borderRadius: 12,
    fontWeight: 800,
    textDecoration: 'none',
  },

  secondary: {
    display: 'block',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,.4)',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: 12,
    fontWeight: 700,
    textDecoration: 'none',
  },
};