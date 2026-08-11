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
        setError('No fue posible cargar esta propiedad.');
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
            <h1>Propiedad no encontrada</h1>
            <p>{error || 'La propiedad solicitada no está disponible.'}</p>
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

  const superficieUtil = propiedad.superficie_util
    ? `${Number(propiedad.superficie_util).toLocaleString('es-CL')} m²`
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

  const telefonoLimpio = propiedad.telefono_contacto
    ? propiedad.telefono_contacto.replace(/\D/g, '')
    : '';

  const mensajeWhatsapp = encodeURIComponent(
    `Hola, me interesa la propiedad "${propiedad.titulo}" publicada en Hecta. ¿Me pueden dar más información?`
  );

  const whatsappUrl = telefonoLimpio
    ? `https://wa.me/${telefonoLimpio}?text=${mensajeWhatsapp}`
    : null;

  const mapaUrl = tieneCoordenadas
    ? `https://www.google.com/maps?q=${latitud},${longitud}&z=15&output=embed`
    : null;

  const googleMapsUrl = tieneCoordenadas
    ? `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`
    : null;

  const youtubeEmbed = getYoutubeEmbedUrl(
    propiedad.video_youtube
  );

  function fotoAnterior() {
    if (imagenes.length === 0) return;

    setFotoActiva((actual) =>
      actual === 0
        ? imagenes.length - 1
        : actual - 1
    );
  }

  function fotoSiguiente() {
    if (imagenes.length === 0) return;

    setFotoActiva((actual) =>
      actual === imagenes.length - 1
        ? 0
        : actual + 1
    );
  }

  return (
    <main className="page">
      <div className="container">

        {/* VOLVER */}

        <a href="/#propiedades" className="back">
          <ArrowLeft size={18} />
          Volver a propiedades
        </a>

        {/* ENCABEZADO */}

        <section className="property-header">
          <div className="header-copy">
            <span className="operation">
              {propiedad.operacion || 'Venta'}
            </span>

            <h1>
              {propiedad.titulo}
            </h1>

            <div className="location">
              <MapPin size={19} />

              <span>
                {ubicacion || 'Ubicación por confirmar'}
              </span>
            </div>
          </div>

          <div className="price">
            {precio}
          </div>
        </section>

        {/* GALERÍA */}

        <section className="gallery">
          {imagenes.length > 0 ? (
            <>
              <div
                className="main-photo"
                onClick={() => setGaleriaAbierta(true)}
              >
                <img
                  src={imagenes[0]}
                  alt={propiedad.titulo}
                />

                <button
                  type="button"
                  className="photos-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFotoActiva(0);
                    setGaleriaAbierta(true);
                  }}
                >
                  <Images size={18} />

                  Ver {imagenes.length}{' '}
                  {imagenes.length === 1
                    ? 'foto'
                    : 'fotos'}
                </button>
              </div>

              {imagenes.length > 1 && (
                <div className="side-photos">
                  {imagenes
                    .slice(1, 5)
                    .map((imagen, index) => (
                      <button
                        type="button"
                        className="mini-photo"
                        key={`${imagen}-${index}`}
                        onClick={() => {
                          setFotoActiva(index + 1);
                          setGaleriaAbierta(true);
                        }}
                      >
                        <img
                          src={imagen}
                          alt={`${propiedad.titulo} ${
                            index + 2
                          }`}
                        />

                        {index === 3 &&
                          imagenes.length > 5 && (
                            <span className="more-overlay">
                              +{imagenes.length - 5}
                            </span>
                          )}
                      </button>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image">
              <Images size={44} />
              <span>Sin fotografías</span>
            </div>
          )}
        </section>

        {/* CONTENIDO */}

        <div className="content-layout">

          <div className="main-content">

            {/* RESUMEN */}

            <section className="info-card">
              <h2>Información principal</h2>

              <div className="quick-features">

                {superficieTotal && (
                  <QuickFeature
                    icon={Ruler}
                    label="Superficie"
                    value={superficieTotal}
                  />
                )}

                {propiedad.dormitorios != null && (
                  <QuickFeature
                    icon={BedDouble}
                    label="Dormitorios"
                    value={propiedad.dormitorios}
                  />
                )}

                {propiedad.banos != null && (
                  <QuickFeature
                    icon={Bath}
                    label="Baños"
                    value={propiedad.banos}
                  />
                )}

                {propiedad.estacionamientos != null && (
                  <QuickFeature
                    icon={Car}
                    label="Estacionamientos"
                    value={propiedad.estacionamientos}
                  />
                )}

              </div>
            </section>

            {/* DESCRIPCIÓN */}

            <section className="info-card">
              <h2>Descripción</h2>

              <p className="description">
                {propiedad.descripcion ||
                  'Sin descripción disponible.'}
              </p>
            </section>

            {/* CARACTERÍSTICAS */}

            <section className="info-card">
              <h2>Características</h2>

              <div className="features-grid">

                {propiedad.tipo && (
                  <Feature
                    label="Tipo de propiedad"
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

              </div>

              <div className="services-grid">

                <Service
                  icon={Droplets}
                  label="Agua"
                  value={formatFactibilidad(
                    propiedad.factibilidad_agua
                  )}
                />

                <Service
                  icon={Zap}
                  label="Electricidad"
                  value={formatFactibilidad(
                    propiedad.factibilidad_luz
                  )}
                />

                {propiedad.bodegas != null && (
                  <Service
                    icon={Warehouse}
                    label="Bodega"
                    value={
                      propiedad.bodegas > 0
                        ? 'Sí'
                        : 'No'
                    }
                  />
                )}

              </div>
            </section>

            {/* MAPA */}

            {(tieneCoordenadas ||
              propiedad.direccion) && (
              <section className="info-card">
                <div className="section-title-row">
                  <div>
                    <h2>Ubicación</h2>

                    {propiedad.direccion && (
                      <p className="address">
                        {propiedad.direccion}
                      </p>
                    )}
                  </div>

                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="map-link"
                    >
                      Abrir en Google Maps
                      <ExternalLink size={16} />
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
              <section className="info-card">
                <h2>Video</h2>

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
                    href={propiedad.video_youtube}
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

          {/* CONTACTO */}

          <aside className="sidebar">
            <div className="contact-card">

              <span className="contact-eyebrow">
                CONTACTA A HECTA
              </span>

              <h2>
                ¿Te interesa esta propiedad?
              </h2>

              <p>
                Solicita más información o coordina
                una visita con nuestro equipo.
              </p>

              <div className="contact-price">
                <span>Precio</span>
                <strong>{precio}</strong>
              </div>

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

              {propiedad.telefono_contacto && (
                <a
                  href={`tel:${propiedad.telefono_contacto}`}
                  className="secondary-button"
                >
                  <Phone size={19} />
                  Llamar
                </a>
              )}

              {propiedad.email_contacto && (
                <a
                  href={`mailto:${propiedad.email_contacto}?subject=${encodeURIComponent(
                    `Consulta por ${propiedad.titulo}`
                  )}`}
                  className="secondary-button"
                >
                  <Mail size={19} />
                  Enviar correo
                </a>
              )}

              {propiedad.nombre_contacto && (
                <div className="contact-person">
                  <span>Contacto</span>
                  <strong>
                    {propiedad.nombre_contacto}
                  </strong>
                </div>
              )}

            </div>
          </aside>

        </div>
      </div>

      {/* LIGHTBOX */}

      {galeriaAbierta && imagenes.length > 0 && (
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
              src={imagenes[fotoActiva]}
              alt={`${propiedad.titulo} ${
                fotoActiva + 1
              }`}
            />

            <span>
              {fotoActiva + 1} / {imagenes.length}
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

function QuickFeature({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="quick-feature">
      <Icon size={25} />

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Feature({ label, value }) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  return (
    <div className="feature">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Service({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="service">
      <div className="service-icon">
        <Icon size={23} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function formatearPrecio(precio, moneda) {
  if (
    precio === null ||
    precio === undefined
  ) {
    return 'Precio a consultar';
  }

  const numero =
    Number(precio).toLocaleString('es-CL');

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
    Number(superficie).toLocaleString('es-CL');

  let unidadFinal = unidad || 'm2';

  if (unidadFinal === 'm2') {
    unidadFinal = 'm²';
  }

  return `${numero} ${unidadFinal}`;
}

function formatFactibilidad(valor) {
  if (valor === 'si') {
    return 'Disponible';
  }

  if (valor === 'no') {
    return 'No disponible';
  }

  return 'Por confirmar';
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname.includes(
        'youtube.com'
      )
    ) {
      const videoId =
        parsedUrl.searchParams.get('v');

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
      parsedUrl.hostname === 'youtu.be'
    ) {
      const videoId =
        parsedUrl.pathname.replace('/', '');

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

      .page {
        min-height: 100vh;
        background: #f6f4ee;
        color: #102335;
        padding: 32px 22px 80px;
      }

      .center-page {
        display: grid;
        place-items: center;
      }

      .container {
        width: 100%;
        max-width: 1380px;
        margin: 0 auto;
      }

      .back {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 28px;
        color: #0b5137;
        font-weight: 800;
        text-decoration: none;
      }

      .property-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 30px;
        margin-bottom: 30px;
      }

      .header-copy {
        max-width: 900px;
      }

      .operation {
        display: inline-block;
        color: #aa8438;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 12px;
      }

      .property-header h1 {
        margin: 0 0 12px;
        color: #0a412d;
        font-size: clamp(
          38px,
          5vw,
          70px
        );
        line-height: 1.02;
        letter-spacing: -0.035em;
      }

      .location {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #69746f;
        font-size: 19px;
      }

      .price {
        color: #0b5137;
        font-size: clamp(
          29px,
          3vw,
          43px
        );
        font-weight: 900;
        white-space: nowrap;
      }

      .gallery {
        display: grid;
        grid-template-columns: minmax(
            0,
            2fr
          ) minmax(300px, 0.75fr);
        gap: 10px;
        height: 580px;
        margin-bottom: 34px;
        overflow: hidden;
        border-radius: 22px;
      }

      .main-photo {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        background: #e5e2d9;
      }

      .main-photo > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.25s ease;
      }

      .main-photo:hover > img {
        transform: scale(1.015);
      }

      .photos-button {
        position: absolute;
        right: 18px;
        bottom: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 0;
        border-radius: 10px;
        padding: 12px 16px;
        background: rgba(
          255,
          255,
          255,
          0.94
        );
        color: #102335;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 4px 20px
          rgba(0, 0, 0, 0.12);
      }

      .side-photos {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(
          4,
          1fr
        );
        gap: 10px;
        min-height: 0;
      }

      .mini-photo {
        position: relative;
        width: 100%;
        min-height: 0;
        border: 0;
        padding: 0;
        overflow: hidden;
        cursor: pointer;
        background: #e5e2d9;
      }

      .mini-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .more-overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(
          5,
          35,
          26,
          0.58
        );
        color: white;
        font-size: 28px;
        font-weight: 900;
      }

      .no-image {
        grid-column: 1 / -1;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 12px;
        min-height: 400px;
        background: #e9e6dd;
        color: #68736d;
      }

      .content-layout {
        display: grid;
        grid-template-columns:
          minmax(0, 2fr)
          minmax(320px, 0.8fr);
        gap: 30px;
        align-items: start;
      }

      .main-content {
        display: grid;
        gap: 22px;
      }

      .info-card {
        background: white;
        border: 1px solid #dfdbd0;
        border-radius: 20px;
        padding: 30px;
      }

      .info-card h2 {
        margin: 0 0 22px;
        color: #0c402e;
        font-size: 25px;
      }

      .quick-features {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(180px, 1fr)
          );
        gap: 15px;
      }

      .quick-feature {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 17px;
        background: #f7f5ef;
        border-radius: 14px;
        color: #0b5137;
      }

      .quick-feature div {
        display: grid;
        gap: 3px;
      }

      .quick-feature strong {
        color: #102335;
        font-size: 17px;
      }

      .quick-feature span {
        color: #707973;
        font-size: 13px;
      }

      .description {
        margin: 0;
        color: #47534d;
        line-height: 1.8;
        font-size: 17px;
        white-space: pre-line;
      }

      .features-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(190px, 1fr)
          );
        gap: 12px;
      }

      .feature {
        display: grid;
        gap: 6px;
        padding: 16px;
        border-radius: 12px;
        background: #f7f5ef;
      }

      .feature span {
        color: #747d77;
        font-size: 13px;
      }

      .feature strong {
        color: #102335;
      }

      .services-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(180px, 1fr)
          );
        gap: 12px;
        margin-top: 18px;
      }

      .service {
        display: flex;
        align-items: center;
        gap: 11px;
        border: 1px solid #e4e0d5;
        border-radius: 13px;
        padding: 14px;
      }

      .service-icon {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: #f3efe4;
        color: #0b5137;
      }

      .service > div:last-child {
        display: grid;
        gap: 3px;
      }

      .service span {
        color: #747d77;
        font-size: 12px;
      }

      .section-title-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 18px;
      }

      .section-title-row h2 {
        margin-bottom: 5px;
      }

      .address {
        margin: 0;
        color: #67726d;
      }

      .map-link {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #0b5137;
        font-weight: 800;
        text-decoration: none;
        white-space: nowrap;
      }

      .map-wrapper {
        height: 390px;
        overflow: hidden;
        border-radius: 15px;
      }

      .map-wrapper iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }

      .video-wrapper {
        position: relative;
        overflow: hidden;
        border-radius: 15px;
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
        gap: 9px;
        color: #0b5137;
        font-weight: 800;
        text-decoration: none;
      }

      .sidebar {
        position: sticky;
        top: 24px;
      }

      .contact-card {
        display: grid;
        gap: 15px;
        padding: 28px;
        border-radius: 22px;
        background: #084c35;
        color: white;
        box-shadow: 0 15px 40px
          rgba(4, 55, 38, 0.15);
      }

      .contact-eyebrow {
        color: #e0bb68;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.11em;
      }

      .contact-card h2 {
        margin: 0;
        font-size: 27px;
        line-height: 1.15;
      }

      .contact-card > p {
        margin: 0 0 4px;
        color: rgba(
          255,
          255,
          255,
          0.82
        );
        line-height: 1.55;
      }

      .contact-price {
        display: grid;
        gap: 4px;
        padding: 15px 0 18px;
        border-bottom: 1px solid
          rgba(255, 255, 255, 0.16);
      }

      .contact-price span {
        font-size: 12px;
        color: rgba(
          255,
          255,
          255,
          0.7
        );
      }

      .contact-price strong {
        font-size: 25px;
      }

      .whatsapp-button,
      .secondary-button {
        min-height: 50px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        padding: 10px 14px;
        font-weight: 850;
        text-decoration: none;
      }

      .whatsapp-button {
        background: white;
        color: #084c35;
      }

      .secondary-button {
        border: 1px solid
          rgba(255, 255, 255, 0.35);
        color: white;
      }

      .contact-person {
        display: grid;
        gap: 3px;
        padding-top: 8px;
      }

      .contact-person span {
        font-size: 12px;
        color: rgba(
          255,
          255,
          255,
          0.67
        );
      }

      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: grid;
        place-items: center;
        background: rgba(
          4,
          15,
          11,
          0.95
        );
        padding: 35px 80px;
      }

      .lightbox-content {
        max-width: 1250px;
        width: 100%;
        display: grid;
        justify-items: center;
        gap: 13px;
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
        color: white;
        background: transparent;
        cursor: pointer;
      }

      .close-lightbox {
        position: absolute;
        right: 25px;
        top: 23px;
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
        background: white;
        border-radius: 18px;
      }

      @media (
        max-width: 980px
      ) {
        .property-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .gallery {
          grid-template-columns: 1fr;
          height: auto;
        }

        .main-photo {
          height: 450px;
          border-radius: 20px;
        }

        .side-photos {
          grid-template-columns:
            repeat(4, 1fr);
          grid-template-rows: 120px;
        }

        .content-layout {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: static;
        }
      }

      @media (
        max-width: 620px
      ) {
        .page {
          padding: 20px 14px 60px;
        }

        .property-header h1 {
          font-size: 39px;
        }

        .price {
          font-size: 29px;
        }

        .main-photo {
          height: 320px;
        }

        .side-photos {
          grid-template-columns:
            repeat(2, 1fr);
          grid-template-rows:
            repeat(2, 100px);
        }

        .info-card {
          padding: 21px;
        }

        .section-title-row {
          flex-direction: column;
        }

        .map-wrapper {
          height: 300px;
        }

        .lightbox {
          padding: 60px 12px 30px;
        }

        .gallery-left {
          left: 2px;
        }

        .gallery-right {
          right: 2px;
        }
      }
    `}</style>
  );
}