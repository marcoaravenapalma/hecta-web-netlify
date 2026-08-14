'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  ChevronLeft,
  ChevronRight,
  Droplets,
  ExternalLink,
  Images,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Ruler,
  Warehouse,
  X,
  Zap,
} from 'lucide-react';

import { supabase } from '../../../lib/supabase';

export default function PropiedadPage() {
  const params = useParams();
  const id = params?.id;

  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fotoActiva, setFotoActiva] = useState(0);
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);

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
        console.error('Error cargando propiedad:', error);

        setError(
          'No fue posible cargar esta propiedad.'
        );

        setLoading(false);
        return;
      }

      setPropiedad(data);
      setLoading(false);
    }

    cargarPropiedad();
  }, [id]);

  const imagenes = useMemo(() => {
    if (
      !propiedad ||
      !Array.isArray(propiedad.imagenes) ||
      propiedad.imagenes.length === 0
    ) {
      return [];
    }

    return propiedad.imagenes.filter(Boolean);
  }, [propiedad]);

  if (loading) {
    return (
      <main className="page center-page">
        <p>Cargando propiedad...</p>
        <Styles />
      </main>
    );
  }

  if (error || !propiedad) {
    return (
      <main className="page">
        <div className="container">

          <a href="/" className="back">
            <ArrowLeft size={18} />
            Volver al inicio
          </a>

          <div className="empty-card">
            <h1>
              Propiedad no encontrada
            </h1>

            <p>
              {error ||
                'La propiedad solicitada no está disponible.'}
            </p>
          </div>

        </div>

        <Styles />
      </main>
    );
  }

  const precio = formatearPrecio(
    propiedad.precio,
    propiedad.moneda
  );

  const superficieTotal = formatearSuperficie(
    propiedad.superficie_total,
    propiedad.unidad_superficie
  );

  const superficieUtil =
    propiedad.superficie_util
      ? `${Number(
          propiedad.superficie_util
        ).toLocaleString('es-CL')} m²`
      : null;

  const ubicacion = [
    propiedad.comuna,
    propiedad.region,
  ]
    .filter(Boolean)
    .join(', ');

  const latitud =
    propiedad.latitud ??
    propiedad.lat ??
    null;

  const longitud =
    propiedad.longitud ??
    propiedad.lng ??
    null;

  const tieneCoordenadas =
    latitud !== null &&
    longitud !== null &&
    !Number.isNaN(Number(latitud)) &&
    !Number.isNaN(Number(longitud));

  const telefonoLimpio =
    propiedad.telefono_contacto
      ? propiedad.telefono_contacto.replace(
          /\D/g,
          ''
        )
      : '';

  const mensajeWhatsapp =
    encodeURIComponent(
      `Hola, me interesa la propiedad "${propiedad.titulo}" publicada en Hecta. ¿Me pueden dar más información?`
    );

  const whatsappUrl =
    telefonoLimpio
      ? `https://wa.me/${telefonoLimpio}?text=${mensajeWhatsapp}`
      : null;

  const mapaUrl =
    tieneCoordenadas
      ? `https://www.google.com/maps?q=${latitud},${longitud}&z=15&output=embed`
      : null;

  const googleMapsUrl =
    tieneCoordenadas
      ? `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`
      : null;

  const youtubeEmbed =
    getYoutubeEmbedUrl(
      propiedad.video_youtube
    );

  function fotoAnterior() {
    if (imagenes.length === 0) {
      return;
    }

    setFotoActiva((actual) =>
      actual === 0
        ? imagenes.length - 1
        : actual - 1
    );
  }

  function fotoSiguiente() {
    if (imagenes.length === 0) {
      return;
    }

    setFotoActiva((actual) =>
      actual === imagenes.length - 1
        ? 0
        : actual + 1
    );
  }

  function abrirFoto(index) {
    setFotoActiva(index);
    setGaleriaAbierta(true);
  }

  return (
    <main className="page">

      <div className="container">

        {/* NAVEGACIÓN */}

        <div className="breadcrumb-row">

          <a
            href="/#propiedades"
            className="back"
          >
            <ArrowLeft size={17} />
            Volver a propiedades
          </a>

          <span className="breadcrumb">
            {propiedad.tipo || 'Propiedad'}
            {' · '}
            {propiedad.operacion || 'Venta'}
            {propiedad.comuna
              ? ` · ${propiedad.comuna}`
              : ''}
          </span>

        </div>

        {/* BLOQUE SUPERIOR */}

        <section className="top-layout">

          {/* IZQUIERDA */}

          <div className="visual-column">

            <Gallery
              imagenes={imagenes}
              titulo={propiedad.titulo}
              onOpen={abrirFoto}
            />

          </div>

          {/* DERECHA */}

          <aside className="summary-column">

            <div className="summary-card">

              <span className="property-type">
                {propiedad.tipo || 'Propiedad'}{' '}
                en{' '}
                {propiedad.operacion || 'Venta'}
              </span>

              <h1>
                {propiedad.titulo}
              </h1>

              <div className="summary-location">
                <MapPin size={18} />

                <span>
                  {ubicacion ||
                    'Ubicación por confirmar'}
                </span>
              </div>

              <div className="summary-price">
                {precio}
              </div>

              <div className="summary-divider" />

              <div className="summary-features">

                {superficieTotal && (
                  <SummaryFeature
                    icon={Ruler}
                    value={superficieTotal}
                    label="Superficie total"
                  />
                )}

                {propiedad.dormitorios != null &&
                  propiedad.dormitorios > 0 && (
                    <SummaryFeature
                      icon={BedDouble}
                      value={propiedad.dormitorios}
                      label="Dormitorios"
                    />
                  )}

                {propiedad.banos != null &&
                  propiedad.banos > 0 && (
                    <SummaryFeature
                      icon={Bath}
                      value={propiedad.banos}
                      label="Baños"
                    />
                  )}

                {propiedad.estacionamientos !=
                  null &&
                  propiedad.estacionamientos >
                    0 && (
                    <SummaryFeature
                      icon={Car}
                      value={
                        propiedad.estacionamientos
                      }
                      label="Estacionamientos"
                    />
                  )}

              </div>

              {(propiedad.factibilidad_agua ||
                propiedad.factibilidad_luz) && (
                <div className="factibilities">

                  <SmallFact
                    icon={Droplets}
                    label="Agua"
                    value={formatFactibilidad(
                      propiedad.factibilidad_agua
                    )}
                  />

                  <SmallFact
                    icon={Zap}
                    label="Electricidad"
                    value={formatFactibilidad(
                      propiedad.factibilidad_luz
                    )}
                  />

                </div>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-button"
                >
                  <MessageCircle size={20} />
                  Consultar por WhatsApp
                </a>
              )}

              <div className="secondary-actions">

                {propiedad.telefono_contacto && (
                  <a
                    href={`tel:${propiedad.telefono_contacto}`}
                  >
                    <Phone size={17} />
                    Llamar
                  </a>
                )}

                {propiedad.email_contacto && (
                  <a
                    href={`mailto:${propiedad.email_contacto}?subject=${encodeURIComponent(
                      `Consulta por ${propiedad.titulo}`
                    )}`}
                  >
                    <Mail size={17} />
                    Email
                  </a>
                )}

              </div>

              <div className="published-by">
                <span>
                  Publicado por
                </span>

                <strong>
                  Hecta
                </strong>
              </div>

            </div>

          </aside>

        </section>

        {/* CUERPO */}

        <div className="body-layout">

          <div className="main-content">

            {/* INFORMACIÓN */}

            <section className="content-section">

              <h2>
                Información de la propiedad
              </h2>

              <div className="features-grid">

                {propiedad.tipo && (
                  <Feature
                    label="Tipo"
                    value={propiedad.tipo}
                  />
                )}

                {superficieTotal && (
                  <Feature
                    label="Superficie total"
                    value={superficieTotal}
                  />
                )}

                {superficieUtil && (
                  <Feature
                    label="Superficie útil"
                    value={superficieUtil}
                  />
                )}

                {propiedad.dormitorios !=
                  null && (
                  <Feature
                    label="Dormitorios"
                    value={
                      propiedad.dormitorios
                    }
                  />
                )}

                {propiedad.banos != null && (
                  <Feature
                    label="Baños"
                    value={propiedad.banos}
                  />
                )}

                {propiedad.estacionamientos !=
                  null && (
                  <Feature
                    label="Estacionamientos"
                    value={
                      propiedad.estacionamientos
                    }
                  />
                )}

                {propiedad.bodegas != null && (
                  <Feature
                    label="Bodegas"
                    value={propiedad.bodegas}
                  />
                )}

                <Feature
                  label="Factibilidad de agua"
                  value={formatFactibilidad(
                    propiedad.factibilidad_agua
                  )}
                />

                <Feature
                  label="Factibilidad eléctrica"
                  value={formatFactibilidad(
                    propiedad.factibilidad_luz
                  )}
                />

              </div>

            </section>

            {/* DESCRIPCIÓN */}

            <section className="content-section">

              <h2>
                Descripción
              </h2>

              <p className="description">
                {propiedad.descripcion ||
                  'Sin descripción disponible.'}
              </p>

            </section>

            {/* UBICACIÓN */}

            {(tieneCoordenadas ||
              propiedad.direccion) && (
              <section className="content-section">

                <div className="section-title-row">

                  <div>

                    <h2>
                      Ubicación
                    </h2>

                    <div className="location-address">

                      <MapPin size={18} />

                      <span>
                        {propiedad.direccion ||
                          ubicacion}
                      </span>

                    </div>

                  </div>

                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="map-link"
                    >
                      Abrir en Google Maps
                      <ExternalLink size={15} />
                    </a>
                  )}

                </div>

                {mapaUrl && (
                  <div className="map-wrapper">

                    <iframe
                      src={mapaUrl}
                      title={`Mapa de ${propiedad.titulo}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />

                  </div>
                )}

              </section>
            )}

            {/* VIDEO */}

            {propiedad.video_youtube && (
              <section className="content-section">

                <h2>
                  Video
                </h2>

                {youtubeEmbed ? (
                  <div className="video-wrapper">

                    <iframe
                      src={youtubeEmbed}
                      title={`Video de ${propiedad.titulo}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />

                  </div>
                ) : (
                  <a
                    href={
                      propiedad.video_youtube
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="youtube-link"
                  >
                    <PlayCircle size={21} />
                    Ver video en YouTube
                  </a>
                )}

              </section>
            )}

          </div>

          {/* CONTACTO INFERIOR */}

          <aside className="contact-side">

            <div className="contact-box">

              <span className="contact-eyebrow">
                CONTACTA A HECTA
              </span>

              <h3>
                ¿Te interesa esta propiedad?
              </h3>

              <p>
                Solicita más información o
                coordina una visita.
              </p>

              {propiedad.nombre_contacto && (
                <div className="contact-person">

                  <span>
                    Contacto
                  </span>

                  <strong>
                    {
                      propiedad.nombre_contacto
                    }
                  </strong>

                </div>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-whatsapp"
                >
                  <MessageCircle size={19} />
                  WhatsApp
                </a>
              )}

            </div>

          </aside>

        </div>

      </div>

      {/* LIGHTBOX */}

      {galeriaAbierta &&
        imagenes.length > 0 && (
          <div
            className="lightbox"
            role="dialog"
            aria-modal="true"
          >

            <button
              type="button"
              className="close-lightbox"
              onClick={() =>
                setGaleriaAbierta(false)
              }
              aria-label="Cerrar galería"
            >
              <X size={30} />
            </button>

            {imagenes.length > 1 && (
              <button
                type="button"
                className="gallery-arrow gallery-left"
                onClick={fotoAnterior}
                aria-label="Foto anterior"
              >
                <ChevronLeft size={38} />
              </button>
            )}

            <div className="lightbox-content">

              <img
                src={
                  imagenes[fotoActiva]
                }
                alt={`${propiedad.titulo} ${
                  fotoActiva + 1
                }`}
              />

              <span>
                {fotoActiva + 1} /{' '}
                {imagenes.length}
              </span>

            </div>

            {imagenes.length > 1 && (
              <button
                type="button"
                className="gallery-arrow gallery-right"
                onClick={fotoSiguiente}
                aria-label="Foto siguiente"
              >
                <ChevronRight size={38} />
              </button>
            )}

          </div>
        )}

      <Styles />

    </main>
  );
}

function Gallery({
  imagenes,
  titulo,
  onOpen,
}) {
  if (imagenes.length === 0) {
    return (
      <div className="gallery-empty">
        <Images size={42} />
        <span>Sin fotografías</span>
      </div>
    );
  }

  const miniaturas =
    imagenes.slice(1, 5);

  return (
    <div className="gallery">

      {/* MINIATURAS */}

      {imagenes.length > 1 && (
        <div className="thumb-column">

          {miniaturas.map(
            (imagen, index) => (
              <button
                key={`${imagen}-${index}`}
                type="button"
                className="thumbnail"
                onClick={() =>
                  onOpen(index + 1)
                }
              >
                <img
                  src={imagen}
                  alt={`${titulo} ${
                    index + 2
                  }`}
                />

                {index === 3 &&
                  imagenes.length > 5 && (
                    <span className="thumb-more">
                      +{imagenes.length - 5}
                    </span>
                  )}

              </button>
            )
          )}

        </div>
      )}

      {/* FOTO PRINCIPAL */}

      <div
        className="main-image"
        onClick={() => onOpen(0)}
      >

        <img
          src={imagenes[0]}
          alt={titulo}
        />

        <button
          type="button"
          className="all-photos"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(0);
          }}
        >
          <Images size={17} />

          Ver {imagenes.length}{' '}
          {imagenes.length === 1
            ? 'foto'
            : 'fotos'}
        </button>

      </div>

    </div>
  );
}

function SummaryFeature({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="summary-feature">

      <Icon size={20} />

      <div>
        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>
      </div>

    </div>
  );
}

function SmallFact({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="small-fact">

      <Icon size={17} />

      <span>
        {label}: <strong>{value}</strong>
      </span>

    </div>
  );
}

function Feature({
  label,
  value,
}) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  return (
    <div className="feature">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

function formatearPrecio(
  precio,
  moneda
) {
  if (
    precio === null ||
    precio === undefined
  ) {
    return 'Precio a consultar';
  }

  const numero =
    Number(precio).toLocaleString(
      'es-CL'
    );

  if (moneda === 'UF') {
    return `${numero} UF`;
  }

  return `$${numero}`;
}

function formatearSuperficie(
  superficie,
  unidad
) {
  if (
    superficie === null ||
    superficie === undefined
  ) {
    return null;
  }

  const numero =
    Number(
      superficie
    ).toLocaleString('es-CL');

  let unidadFinal =
    unidad || 'm2';

  if (unidadFinal === 'm2') {
    unidadFinal = 'm²';
  }

  return `${numero} ${unidadFinal}`;
}

function formatFactibilidad(valor) {
  if (valor === 'si') {
    return 'Sí';
  }

  if (valor === 'no') {
    return 'No';
  }

  return 'Por confirmar';
}

function getYoutubeEmbedUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl =
      new URL(url);

    if (
      parsedUrl.hostname.includes(
        'youtube.com'
      )
    ) {
      const videoId =
        parsedUrl.searchParams.get(
          'v'
        );

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (
        parsedUrl.pathname.startsWith(
          '/embed/'
        )
      ) {
        return url;
      }
    }

    if (
      parsedUrl.hostname ===
      'youtu.be'
    ) {
      const videoId =
        parsedUrl.pathname.replace(
          '/',
          ''
        );

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
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

      .page {
        min-height: 100vh;
        padding: 24px 20px 80px;
        background: #f6f4ee;
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

      .center-page {
        display: grid;
        place-items: center;
      }

      .container {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
      }

      /* NAVEGACIÓN */

      .breadcrumb-row {
        min-height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 18px;
      }

      .back {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #0b5137;
        font-size: 14px;
        font-weight: 800;
        text-decoration: none;
      }

      .breadcrumb {
        color: #7a837e;
        font-size: 13px;
      }

      /* TOP */

      .top-layout {
        display: grid;
        grid-template-columns:
          minmax(0, 1.8fr)
          minmax(330px, 0.72fr);
        gap: 22px;
        align-items: start;
        margin-bottom: 32px;
      }

      /* GALERÍA */

      .gallery {
        height: 470px;
        display: grid;
        grid-template-columns:
          105px
          minmax(0, 1fr);
        gap: 10px;
      }

      .thumb-column {
        min-height: 0;
        display: grid;
        grid-template-rows:
          repeat(4, 1fr);
        gap: 9px;
      }

      .thumbnail {
        position: relative;
        width: 100%;
        min-height: 0;
        overflow: hidden;
        border: 2px solid transparent;
        border-radius: 10px;
        padding: 0;
        background: #e4e2db;
        cursor: pointer;
      }

      .thumbnail:hover {
        border-color: #0b5137;
      }

      .thumbnail img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .thumb-more {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(
          5,
          43,
          30,
          0.6
        );
        color: white;
        font-size: 22px;
        font-weight: 900;
      }

      .main-image {
        position: relative;
        min-width: 0;
        height: 100%;
        overflow: hidden;
        border-radius: 15px;
        background: #e5e2da;
        cursor: pointer;
      }

      .main-image > img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        transition: transform 0.2s ease;
      }

      .main-image:hover > img {
        transform: scale(1.012);
      }

      .all-photos {
        position: absolute;
        right: 14px;
        bottom: 14px;
        min-height: 41px;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 0 13px;
        border: 1px solid
          rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        background: rgba(
          255,
          255,
          255,
          0.96
        );
        color: #17332a;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        box-shadow:
          0 4px 14px
          rgba(
            0,
            0,
            0,
            0.12
          );
      }

      .gallery-empty {
        height: 470px;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 10px;
        border-radius: 15px;
        background: #e8e5dd;
        color: #727c77;
      }

      /* RESUMEN DERECHO */

      .summary-column {
        min-width: 0;
      }

      .summary-card {
        padding: 24px;
        border: 1px solid #dfdbd1;
        border-radius: 16px;
        background: white;
        box-shadow:
          0 7px 25px
          rgba(
            16,
            35,
            53,
            0.045
          );
      }

      .property-type {
        color: #7a837e;
        font-size: 13px;
      }

      .summary-card h1 {
        margin:
          9px
          0
          10px;
        color: #112820;
        font-size: 30px;
        line-height: 1.12;
        letter-spacing:
          -0.025em;
      }

      .summary-location {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        color: #69736e;
        font-size: 14px;
        line-height: 1.45;
      }

      .summary-location svg {
        flex: 0 0 auto;
        margin-top: 1px;
      }

      .summary-price {
        margin-top: 22px;
        color: #0b5137;
        font-size: 34px;
        line-height: 1;
        font-weight: 900;
        letter-spacing:
          -0.025em;
      }

      .summary-divider {
        height: 1px;
        margin: 20px 0;
        background: #e5e1d8;
      }

      .summary-features {
        display: grid;
        grid-template-columns:
          repeat(2, 1fr);
        gap: 10px;
      }

      .summary-feature {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
        padding: 11px;
        border-radius: 10px;
        background: #f7f6f2;
        color: #0b5137;
      }

      .summary-feature div {
        min-width: 0;
        display: grid;
        gap: 2px;
      }

      .summary-feature strong {
        overflow: hidden;
        color: #173129;
        font-size: 14px;
        text-overflow: ellipsis;
      }

      .summary-feature span {
        color: #78817c;
        font-size: 11px;
      }

      .factibilities {
        display: grid;
        gap: 8px;
        margin-top: 15px;
      }

      .small-fact {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #5f6b65;
        font-size: 13px;
      }

      .small-fact svg {
        color: #0b5137;
      }

      .small-fact strong {
        color: #173129;
      }

      .whatsapp-button {
        min-height: 52px;
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border-radius: 9px;
        background: #0b5137;
        color: white;
        font-size: 15px;
        font-weight: 850;
        text-decoration: none;
      }

      .secondary-actions {
        display: grid;
        grid-template-columns:
          repeat(2, 1fr);
        gap: 8px;
        margin-top: 9px;
      }

      .secondary-actions a {
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 1px solid #dbd8d0;
        border-radius: 8px;
        background: white;
        color: #244238;
        font-size: 12px;
        font-weight: 750;
        text-decoration: none;
      }

      .published-by {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid #ebe8e1;
        color: #7a837e;
        font-size: 12px;
      }

      .published-by strong {
        color: #0b5137;
      }

      /* CUERPO */

      .body-layout {
        display: grid;
        grid-template-columns:
          minmax(0, 1fr)
          285px;
        gap: 28px;
        align-items: start;
      }

      .main-content {
        min-width: 0;
      }

      .content-section {
        padding:
          27px
          0
          30px;
        border-top: 1px solid #dedbd2;
      }

      .content-section:first-child {
        border-top: 0;
        padding-top: 0;
      }

      .content-section h2 {
        margin:
          0
          0
          20px;
        color: #16372c;
        font-size: 25px;
        letter-spacing:
          -0.015em;
      }

      .features-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              180px,
              1fr
            )
          );
        gap: 1px;
        overflow: hidden;
        border: 1px solid #dfdcd3;
        border-radius: 12px;
        background: #dfdcd3;
      }

      .feature {
        min-height: 83px;
        display: grid;
        align-content: center;
        gap: 6px;
        padding: 15px;
        background: white;
      }

      .feature span {
        color: #77807b;
        font-size: 12px;
      }

      .feature strong {
        color: #16372c;
        font-size: 15px;
      }

      .description {
        max-width: 850px;
        margin: 0;
        color: #48554f;
        font-size: 16px;
        line-height: 1.8;
        white-space: pre-line;
      }

      .section-title-row {
        display: flex;
        justify-content:
          space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 17px;
      }

      .section-title-row h2 {
        margin-bottom: 9px;
      }

      .location-address {
        display: flex;
        align-items: flex-start;
        gap: 7px;
        color: #626e68;
        font-size: 14px;
      }

      .map-link {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 6px;
        color: #0b5137;
        font-size: 13px;
        font-weight: 800;
        text-decoration: none;
      }

      .map-wrapper {
        width: 100%;
        height: 360px;
        overflow: hidden;
        border-radius: 12px;
      }

      .map-wrapper iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }

      .video-wrapper {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        padding-top: 56.25%;
      }

      .video-wrapper iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }

      .youtube-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #0b5137;
        font-weight: 800;
        text-decoration: none;
      }

      /* CONTACTO INFERIOR */

      .contact-side {
        position: sticky;
        top: 20px;
      }

      .contact-box {
        padding: 22px;
        border: 1px solid #dedbd2;
        border-radius: 14px;
        background: white;
      }

      .contact-eyebrow {
        color: #b08839;
        font-size: 10px;
        font-weight: 900;
        letter-spacing:
          0.12em;
      }

      .contact-box h3 {
        margin:
          8px
          0
          8px;
        color: #16372c;
        font-size: 21px;
        line-height: 1.2;
      }

      .contact-box > p {
        margin:
          0
          0
          17px;
        color: #6c7671;
        font-size: 13px;
        line-height: 1.5;
      }

      .contact-person {
        display: grid;
        gap: 3px;
        margin-bottom: 15px;
        padding:
          12px
          0;
        border-top: 1px solid #ece9e2;
      }

      .contact-person span {
        color: #7e8782;
        font-size: 11px;
      }

      .contact-person strong {
        color: #18372c;
        font-size: 14px;
      }

      .contact-whatsapp {
        min-height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 8px;
        background: #0b5137;
        color: white;
        font-size: 13px;
        font-weight: 850;
        text-decoration: none;
      }

      /* LIGHTBOX */

      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: grid;
        place-items: center;
        padding: 35px 80px;
        background: rgba(
          4,
          15,
          11,
          0.96
        );
      }

      .lightbox-content {
        width: 100%;
        max-width: 1250px;
        display: grid;
        justify-items: center;
        gap: 12px;
      }

      .lightbox-content img {
        max-width: 100%;
        max-height: 84vh;
        object-fit: contain;
      }

      .lightbox-content span {
        color: white;
        font-weight: 700;
      }

      .close-lightbox,
      .gallery-arrow {
        border: 0;
        background: transparent;
        color: white;
        cursor: pointer;
      }

      .close-lightbox {
        position: absolute;
        top: 20px;
        right: 24px;
      }

      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }

      .gallery-left {
        left: 20px;
      }

      .gallery-right {
        right: 20px;
      }

      .empty-card {
        padding: 40px;
        border-radius: 18px;
        background: white;
      }

      /* TABLET */

      @media (
        max-width: 1000px
      ) {

        .top-layout {
          grid-template-columns: 1fr;
        }

        .summary-card h1 {
          font-size: 32px;
        }

        .summary-column {
          order: -1;
        }

        .gallery {
          height: 500px;
        }

        .body-layout {
          grid-template-columns: 1fr;
        }

        .contact-side {
          position: static;
        }

      }

      /* MOBILE */

      @media (
        max-width: 650px
      ) {

        .page {
          padding:
            17px
            13px
            60px;
        }

        .breadcrumb {
          display: none;
        }

        .top-layout {
          gap: 14px;
        }

        .summary-column {
          order: 0;
        }

        .visual-column {
          order: -1;
        }

        .gallery {
          height: auto;
          display: block;
        }

        .thumb-column {
          display: none;
        }

        .main-image {
          height: 310px;
          border-radius: 12px;
        }

        .gallery-empty {
          height: 310px;
        }

        .summary-card {
          padding: 20px;
        }

        .summary-card h1 {
          font-size: 27px;
        }

        .summary-price {
          font-size: 29px;
        }

        .summary-features {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .body-layout {
          display: block;
        }

        .content-section {
          padding:
            24px
            0;
        }

        .content-section h2 {
          font-size: 22px;
        }

        .features-grid {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .section-title-row {
          flex-direction: column;
        }

        .map-wrapper {
          height: 290px;
        }

        .contact-side {
          margin-top: 20px;
        }

        .lightbox {
          padding:
            60px
            10px
            25px;
        }

        .gallery-left {
          left: 0;
        }

        .gallery-right {
          right: 0;
        }

      }

    `}</style>
  );
}