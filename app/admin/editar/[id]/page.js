'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';

import { supabase } from '../../../../lib/supabase';

const ADMIN_UID =
  'd8a08746-ce14-407a-80e5-fc9e1a0340aa';

export default function EditarPropiedadPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    operacion: 'Venta',

    moneda: 'CLP',
    precio: '',

    region: '',
    comuna: '',
    direccion: '',

    superficie_total: '',
    superficie_util: '',
    unidad_superficie: 'm2',

    dormitorios: '',
    banos: '',
    estacionamientos: '',
    bodegas: '',

    factibilidad_agua: 'por_confirmar',
    factibilidad_luz: 'por_confirmar',

    video_youtube: '',

    nombre_contacto: '',
    telefono_contacto: '',
    email_contacto: '',

    latitud: '',
    longitud: '',

    estado: 'pendiente',
    publicada: false,
    destacada: false,

    imagenes: [],
  });

  const [nuevaImagen, setNuevaImagen] = useState('');
  const [subiendoFotos, setSubiendoFotos] = useState(false);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    verificarYCargar();
  }, [id]);

  async function verificarYCargar() {
    if (!id) return;

    setLoading(true);
    setError('');

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (
      sessionError ||
      !session?.user ||
      session.user.id !== ADMIN_UID
    ) {
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('propiedades')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error(error);

      setError(
        'No fue posible cargar esta propiedad.'
      );

      setLoading(false);
      return;
    }

    setForm({
      titulo: data.titulo || '',
      descripcion: data.descripcion || '',
      tipo: data.tipo || '',
      operacion: data.operacion || 'Venta',

      moneda: data.moneda || 'CLP',

      precio:
        data.precio !== null &&
        data.precio !== undefined
          ? String(data.precio)
          : '',

      region: data.region || '',
      comuna: data.comuna || '',
      direccion: data.direccion || '',

      superficie_total:
        data.superficie_total !== null &&
        data.superficie_total !== undefined
          ? String(data.superficie_total)
          : '',

      superficie_util:
        data.superficie_util !== null &&
        data.superficie_util !== undefined
          ? String(data.superficie_util)
          : '',

      unidad_superficie:
        data.unidad_superficie || 'm2',

      dormitorios:
        data.dormitorios !== null &&
        data.dormitorios !== undefined
          ? String(data.dormitorios)
          : '',

      banos:
        data.banos !== null &&
        data.banos !== undefined
          ? String(data.banos)
          : '',

      estacionamientos:
        data.estacionamientos !== null &&
        data.estacionamientos !== undefined
          ? String(data.estacionamientos)
          : '',

      bodegas:
        data.bodegas !== null &&
        data.bodegas !== undefined
          ? String(data.bodegas)
          : '',

      factibilidad_agua:
        data.factibilidad_agua ||
        'por_confirmar',

      factibilidad_luz:
        data.factibilidad_luz ||
        'por_confirmar',

      video_youtube:
        data.video_youtube || '',

      nombre_contacto:
        data.nombre_contacto || '',

      telefono_contacto:
        data.telefono_contacto || '',

      email_contacto:
        data.email_contacto || '',

      latitud:
        data.latitud !== null &&
        data.latitud !== undefined
          ? String(data.latitud)
          : '',

      longitud:
        data.longitud !== null &&
        data.longitud !== undefined
          ? String(data.longitud)
          : '',

      estado:
        data.estado || 'pendiente',

      publicada:
        Boolean(data.publicada),

      destacada:
        Boolean(data.destacada),

      imagenes:
        Array.isArray(data.imagenes)
          ? data.imagenes.filter(Boolean)
          : [],
    });

    setLoading(false);
  }

  function cambiarCampo(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((actual) => ({
      ...actual,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  }

  function numeroONull(valor) {
    if (
      valor === '' ||
      valor === null ||
      valor === undefined
    ) {
      return null;
    }

    const numero = Number(valor);

    return Number.isNaN(numero)
      ? null
      : numero;
  }

  async function subirFotos(event) {
    const archivos = Array.from(event.target.files || []);

    if (archivos.length === 0) {
      return;
    }

    setSubiendoFotos(true);
    setError('');
    setMensaje('');

    const urlsNuevas = [];

    try {
      for (const archivo of archivos) {
        if (!archivo.type.startsWith('image/')) {
          continue;
        }

        const extension =
          archivo.name.split('.').pop()?.toLowerCase() || 'jpg';

        const nombreArchivo =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}.${extension}`;

        const ruta = `${id}/${nombreArchivo}`;

        const { error: uploadError } =
          await supabase.storage
            .from('propiedades')
            .upload(ruta, archivo, {
              cacheControl: '3600',
              upsert: false,
              contentType: archivo.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('propiedades')
          .getPublicUrl(ruta);

        if (data?.publicUrl) {
          urlsNuevas.push(data.publicUrl);
        }
      }

      if (urlsNuevas.length === 0) {
        setError(
          'No se pudo subir ninguna fotografía.'
        );

        event.target.value = '';
        return;
      }

      setForm((actual) => ({
        ...actual,
        imagenes: [
          ...actual.imagenes,
          ...urlsNuevas,
        ],
      }));

      setMensaje(
        `${urlsNuevas.length} ${
          urlsNuevas.length === 1
            ? 'fotografía subida'
            : 'fotografías subidas'
        }. Ahora haz clic en Guardar cambios.`
      );
    } catch (uploadError) {
      console.error(
        'Error subiendo fotografías:',
        uploadError
      );

      setError(
        'No fue posible subir las fotografías.'
      );
    } finally {
      event.target.value = '';
      setSubiendoFotos(false);
    }
  }

  function agregarImagen() {
    const url = nuevaImagen.trim();

    if (!url) {
      setError(
        'Ingresa una URL de imagen.'
      );
      return;
    }

    if (
      !url.startsWith('http://') &&
      !url.startsWith('https://')
    ) {
      setError(
        'La imagen debe tener una URL válida que comience con http:// o https://'
      );
      return;
    }

    if (form.imagenes.includes(url)) {
      setError(
        'Esa imagen ya está agregada.'
      );
      return;
    }

    setForm((actual) => ({
      ...actual,
      imagenes: [
        ...actual.imagenes,
        url,
      ],
    }));

    setNuevaImagen('');
    setError('');
    setMensaje(
      'Imagen agregada. Recuerda guardar los cambios.'
    );
  }

  function eliminarImagen(index) {
    setForm((actual) => ({
      ...actual,
      imagenes:
        actual.imagenes.filter(
          (_, i) => i !== index
        ),
    }));

    setMensaje(
      'Imagen eliminada. Recuerda guardar los cambios.'
    );
  }

  function hacerPrincipal(index) {
    if (index === 0) return;

    setForm((actual) => {
      const imagenes = [
        ...actual.imagenes,
      ];

      const seleccionada =
        imagenes[index];

      imagenes.splice(index, 1);

      imagenes.unshift(seleccionada);

      return {
        ...actual,
        imagenes,
      };
    });

    setMensaje(
      'Nueva foto principal seleccionada. Recuerda guardar los cambios.'
    );
  }

  async function guardarCambios(event) {
    event.preventDefault();

    setGuardando(true);
    setError('');
    setMensaje('');

    if (!form.titulo.trim()) {
      setError(
        'El título de la propiedad es obligatorio.'
      );

      setGuardando(false);
      return;
    }

    const datos = {
      titulo:
        form.titulo.trim(),

      descripcion:
        form.descripcion.trim() || null,

      tipo:
        form.tipo || null,

      operacion:
        form.operacion || null,

      moneda:
        form.moneda || 'CLP',

      precio:
        numeroONull(form.precio),

      region:
        form.region.trim() || null,

      comuna:
        form.comuna.trim() || null,

      direccion:
        form.direccion.trim() || null,

      superficie_total:
        numeroONull(
          form.superficie_total
        ),

      superficie_util:
        numeroONull(
          form.superficie_util
        ),

      unidad_superficie:
        form.unidad_superficie || 'm2',

      dormitorios:
        numeroONull(
          form.dormitorios
        ),

      banos:
        numeroONull(
          form.banos
        ),

      estacionamientos:
        numeroONull(
          form.estacionamientos
        ),

      bodegas:
        numeroONull(
          form.bodegas
        ),

      factibilidad_agua:
        form.factibilidad_agua,

      factibilidad_luz:
        form.factibilidad_luz,

      video_youtube:
        form.video_youtube.trim() ||
        null,

      nombre_contacto:
        form.nombre_contacto.trim() ||
        null,

      telefono_contacto:
        form.telefono_contacto.trim() ||
        null,

      email_contacto:
        form.email_contacto.trim() ||
        null,

      latitud:
        numeroONull(
          form.latitud
        ),

      longitud:
        numeroONull(
          form.longitud
        ),

      estado:
        form.estado,

      publicada:
        form.estado ===
        'publicada',

      destacada:
        Boolean(
          form.destacada
        ),

      imagenes:
        form.imagenes,
    };

    const { error } = await supabase
      .from('propiedades')
      .update(datos)
      .eq('id', id);

    if (error) {
      console.error(error);

      setError(
        'No fue posible guardar los cambios.'
      );

      setGuardando(false);
      return;
    }

    setForm((actual) => ({
      ...actual,
      publicada:
        actual.estado ===
        'publicada',
    }));

    setMensaje(
      'Cambios guardados correctamente.'
    );

    setGuardando(false);
  }

  if (loading) {
    return (
      <main className="loading-page">

        <Loader2
          size={35}
          className="spin"
        />

        <p>
          Cargando propiedad...
        </p>

        <Styles />

      </main>
    );
  }

  return (
    <main className="page">

      <div className="container">

        <header className="topbar">

          <div>

            <a
              href="/admin"
              className="back"
            >
              <ArrowLeft size={18} />
              Volver al panel
            </a>

            <span className="eyebrow">
              ADMINISTRACIÓN
            </span>

            <h1>
              Editar propiedad
            </h1>

            <p>
              Modifica la información y guarda los cambios.
            </p>

          </div>

          {form.estado ===
            'publicada' && (
            <a
              href={`/propiedad/${id}`}
              target="_blank"
              rel="noreferrer"
              className="view-property"
            >
              Ver publicación
            </a>
          )}

        </header>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="alert success">
            <Check size={18} />
            {mensaje}
          </div>
        )}

        <form
          onSubmit={
            guardarCambios
          }
          className="form"
        >

          <Section
            title="Información principal"
            text="Datos generales de la propiedad."
          >

            <div className="grid two">

              <Field label="Operación">

                <select
                  name="operacion"
                  value={
                    form.operacion
                  }
                  onChange={
                    cambiarCampo
                  }
                >
                  <option value="Venta">
                    Venta
                  </option>

                  <option value="Arriendo">
                    Arriendo
                  </option>

                  <option value="Temporada">
                    Temporada
                  </option>

                </select>

              </Field>

              <Field label="Tipo de propiedad">

                <select
                  name="tipo"
                  value={
                    form.tipo
                  }
                  onChange={
                    cambiarCampo
                  }
                >

                  <option value="">
                    Seleccionar
                  </option>

                  <option value="Terreno">
                    Terreno
                  </option>

                  <option value="Parcela">
                    Parcela
                  </option>

                  <option value="Campo">
                    Campo
                  </option>

                  <option value="Casa">
                    Casa
                  </option>

                  <option value="Departamento">
                    Departamento
                  </option>

                  <option value="Oficina">
                    Oficina
                  </option>

                  <option value="Local comercial">
                    Local comercial
                  </option>

                  <option value="Bodega">
                    Bodega
                  </option>

                  <option value="Industrial">
                    Industrial
                  </option>

                </select>

              </Field>

            </div>

            <Field label="Título">

              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={
                  cambiarCampo
                }
                required
              />

            </Field>

            <Field label="Descripción">

              <textarea
                name="descripcion"
                value={
                  form.descripcion
                }
                onChange={
                  cambiarCampo
                }
                rows={8}
              />

            </Field>

          </Section>

          <Section
            title="Precio y superficie"
            text="Valores comerciales y dimensiones."
          >

            <div className="grid three">

              <Field label="Moneda">

                <select
                  name="moneda"
                  value={
                    form.moneda
                  }
                  onChange={
                    cambiarCampo
                  }
                >
                  <option value="CLP">
                    CLP
                  </option>

                  <option value="UF">
                    UF
                  </option>
                </select>

              </Field>

              <Field label="Precio">

                <input
                  type="number"
                  name="precio"
                  value={
                    form.precio
                  }
                  onChange={
                    cambiarCampo
                  }
                  min="0"
                />

              </Field>

              <Field label="Unidad">

                <select
                  name="unidad_superficie"
                  value={
                    form.unidad_superficie
                  }
                  onChange={
                    cambiarCampo
                  }
                >
                  <option value="m2">
                    m²
                  </option>

                  <option value="ha">
                    ha
                  </option>
                </select>

              </Field>

            </div>

            <div className="grid two">

              <Field label="Superficie total">

                <input
                  type="number"
                  step="any"
                  name="superficie_total"
                  value={
                    form.superficie_total
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

              <Field label="Superficie útil">

                <input
                  type="number"
                  step="any"
                  name="superficie_util"
                  value={
                    form.superficie_util
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

            </div>

          </Section>

          <Section
            title="Ubicación"
            text="Información geográfica."
          >

            <div className="grid two">

              <Field label="Región">

                <input
                  name="region"
                  value={
                    form.region
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

              <Field label="Comuna">

                <input
                  name="comuna"
                  value={
                    form.comuna
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

            </div>

            <Field label="Dirección">

              <input
                name="direccion"
                value={
                  form.direccion
                }
                onChange={
                  cambiarCampo
                }
              />

            </Field>

            <div className="grid two">

              <Field label="Latitud">

                <input
                  type="number"
                  step="any"
                  name="latitud"
                  value={
                    form.latitud
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

              <Field label="Longitud">

                <input
                  type="number"
                  step="any"
                  name="longitud"
                  value={
                    form.longitud
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

            </div>

          </Section>

          <Section
            title="Características"
            text="Campos utilizados según el tipo de propiedad."
          >

            <div className="grid four">

              <Field label="Dormitorios">

                <input
                  type="number"
                  min="0"
                  name="dormitorios"
                  value={
                    form.dormitorios
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

              <Field label="Baños">

                <input
                  type="number"
                  min="0"
                  name="banos"
                  value={
                    form.banos
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

              <Field label="Estacionamientos">

                <input
                  type="number"
                  min="0"
                  name="estacionamientos"
                  value={
                    form.estacionamientos
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

              <Field label="Bodegas">

                <input
                  type="number"
                  min="0"
                  name="bodegas"
                  value={
                    form.bodegas
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

            </div>

            <div className="grid two">

              <Field label="Agua">

                <select
                  name="factibilidad_agua"
                  value={
                    form.factibilidad_agua
                  }
                  onChange={
                    cambiarCampo
                  }
                >
                  <option value="por_confirmar">
                    Por confirmar
                  </option>

                  <option value="si">
                    Disponible
                  </option>

                  <option value="no">
                    No disponible
                  </option>
                </select>

              </Field>

              <Field label="Electricidad">

                <select
                  name="factibilidad_luz"
                  value={
                    form.factibilidad_luz
                  }
                  onChange={
                    cambiarCampo
                  }
                >
                  <option value="por_confirmar">
                    Por confirmar
                  </option>

                  <option value="si">
                    Disponible
                  </option>

                  <option value="no">
                    No disponible
                  </option>
                </select>

              </Field>

            </div>

          </Section>

          <Section
            title="Fotografías"
            text="La primera imagen será la fotografía principal de la publicación."
          >

            <div className="upload-area">

              <label className="upload-button">

                {subiendoFotos ? (
                  <Loader2
                    size={19}
                    className="spin"
                  />
                ) : (
                  <Upload size={19} />
                )}

                {subiendoFotos
                  ? 'Subiendo fotos...'
                  : 'Subir fotografías'}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={subirFotos}
                  disabled={subiendoFotos}
                />

              </label>

              <p>
                Puedes seleccionar varias fotografías al mismo tiempo desde tu Mac.
              </p>

            </div>

            <div className="url-divider">
              <span>o agregar por URL</span>
            </div>

            <div className="add-image">

              <input
                type="url"
                value={
                  nuevaImagen
                }
                onChange={(event) =>
                  setNuevaImagen(
                    event.target.value
                  )
                }
                placeholder="https://..."
              />

              <button
                type="button"
                onClick={
                  agregarImagen
                }
              >
                <ImagePlus size={18} />
                Agregar URL
              </button>

            </div>

            {form.imagenes.length ===
              0 ? (
              <div className="no-images">
                Todavía no hay fotografías.
              </div>
            ) : (
              <div className="images-grid">

                {form.imagenes.map(
                  (
                    imagen,
                    index
                  ) => (
                    <div
                      className="image-card"
                      key={`${imagen}-${index}`}
                    >

                      <div className="image-preview">

                        <img
                          src={
                            imagen
                          }
                          alt={`Foto ${
                            index + 1
                          }`}
                        />

                        {index ===
                          0 && (
                          <span className="main-badge">
                            Principal
                          </span>
                        )}

                      </div>

                      <div className="image-actions">

                        {index !==
                          0 && (
                          <button
                            type="button"
                            className="principal"
                            onClick={() =>
                              hacerPrincipal(
                                index
                              )
                            }
                          >
                            <Star
                              size={
                                16
                              }
                            />
                            Principal
                          </button>
                        )}

                        <button
                          type="button"
                          className="remove-image"
                          onClick={() =>
                            eliminarImagen(
                              index
                            )
                          }
                        >
                          <Trash2
                            size={
                              16
                            }
                          />
                          Eliminar
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </Section>

          <Section
            title="Video"
            text="Video opcional de YouTube."
          >

            <Field label="URL de YouTube">

              <input
                type="url"
                name="video_youtube"
                value={
                  form.video_youtube
                }
                onChange={
                  cambiarCampo
                }
                placeholder="https://youtube.com/..."
              />

            </Field>

          </Section>

          <Section
            title="Contacto"
            text="Datos asociados a la publicación."
          >

            <Field label="Nombre">

              <input
                name="nombre_contacto"
                value={
                  form.nombre_contacto
                }
                onChange={
                  cambiarCampo
                }
              />

            </Field>

            <div className="grid two">

              <Field label="Teléfono">

                <input
                  name="telefono_contacto"
                  value={
                    form.telefono_contacto
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

              <Field label="Correo">

                <input
                  type="email"
                  name="email_contacto"
                  value={
                    form.email_contacto
                  }
                  onChange={
                    cambiarCampo
                  }
                />

              </Field>

            </div>

          </Section>

          <Section
            title="Estado de publicación"
            text="Controla el estado de la propiedad."
          >

            <div className="grid two">

              <Field label="Estado">

                <select
                  name="estado"
                  value={
                    form.estado
                  }
                  onChange={
                    cambiarCampo
                  }
                >
                  <option value="pendiente">
                    Pendiente
                  </option>

                  <option value="publicada">
                    Publicada
                  </option>

                  <option value="rechazada">
                    Rechazada
                  </option>
                </select>

              </Field>

              <div className="checkbox-card">

                <input
                  id="destacada"
                  type="checkbox"
                  name="destacada"
                  checked={
                    form.destacada
                  }
                  onChange={
                    cambiarCampo
                  }
                />

                <label htmlFor="destacada">

                  <strong>
                    Propiedad destacada
                  </strong>

                  <span>
                    Permite identificarla como destacada.
                  </span>

                </label>

              </div>

            </div>

          </Section>

          <div className="save-bar">

            <div>
              <strong>
                ¿Terminaste de editar?
              </strong>

              <span>
                Guarda los cambios antes de salir.
              </span>
            </div>

            <button
              type="submit"
              disabled={
                guardando
              }
            >
              {guardando ? (
                <Loader2
                  size={20}
                  className="spin"
                />
              ) : (
                <Save size={20} />
              )}

              {guardando
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>

          </div>

        </form>

      </div>

      <Styles />

    </main>
  );
}

function Section({
  title,
  text,
  children,
}) {
  return (
    <section className="section">

      <div className="section-heading">
        <h2>
          {title}
        </h2>

        {text && (
          <p>
            {text}
          </p>
        )}
      </div>

      <div className="section-content">
        {children}
      </div>

    </section>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <label className="field">
      <span>
        {label}
      </span>

      {children}
    </label>
  );
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
      input,
      select,
      textarea {
        font: inherit;
      }

      .loading-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 12px;
        background: #f5f3ed;
        color: #66716b;
      }

      .spin {
        animation:
          spin
          0.8s
          linear
          infinite;
      }

      @keyframes spin {
        to {
          transform:
            rotate(360deg);
        }
      }

      .page {
        min-height: 100vh;
        padding:
          35px
          20px
          100px;
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

      .container {
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
      }

      .topbar {
        display: flex;
        justify-content:
          space-between;
        align-items:
          flex-end;
        gap: 25px;
        margin-bottom: 28px;
      }

      .back {
        display: flex;
        align-items: center;
        gap: 7px;
        width: fit-content;
        margin-bottom: 28px;
        color: #0b5137;
        font-size: 14px;
        font-weight: 800;
        text-decoration: none;
      }

      .eyebrow {
        color: #aa8438;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.13em;
      }

      .topbar h1 {
        margin:
          7px
          0
          6px;
        color: #0b412e;
        font-size: 45px;
        line-height: 1;
      }

      .topbar p {
        margin: 0;
        color: #6b756f;
      }

      .view-property {
        min-height: 46px;
        display: flex;
        align-items: center;
        padding: 0 17px;
        border:
          1px
          solid
          #d8d4ca;
        border-radius: 10px;
        background: #fff;
        color: #0b5137;
        font-weight: 800;
        text-decoration: none;
      }

      .alert {
        margin-bottom: 18px;
        padding: 14px 16px;
        border-radius: 11px;
        font-size: 14px;
        font-weight: 750;
      }

      .alert.error {
        background: #ffeceb;
        color: #a42b25;
      }

      .alert.success {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #e5f5eb;
        color: #12613f;
      }

      .form {
        display: grid;
        gap: 20px;
      }

      .section {
        display: grid;
        grid-template-columns:
          240px
          minmax(0, 1fr);
        gap: 34px;
        padding: 30px;
        border:
          1px
          solid
          #dfdbd1;
        border-radius: 18px;
        background: #fff;
      }

      .section-heading h2 {
        margin:
          0
          0
          7px;
        color: #123d2d;
        font-size: 19px;
      }

      .section-heading p {
        margin: 0;
        color: #79817c;
        font-size: 13px;
        line-height: 1.5;
      }

      .section-content {
        display: grid;
        gap: 17px;
      }

      .grid {
        display: grid;
        gap: 14px;
      }

      .grid.two {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .grid.three {
        grid-template-columns:
          repeat(3, 1fr);
      }

      .grid.four {
        grid-template-columns:
          repeat(4, 1fr);
      }

      .field {
        display: grid;
        gap: 7px;
      }

      .field > span {
        color: #173b2d;
        font-size: 13px;
        font-weight: 800;
      }

      input,
      select,
      textarea {
        width: 100%;
        border:
          1px
          solid
          #d9d6cd;
        border-radius: 10px;
        outline: 0;
        background: white;
        color: #102335;
      }

      input,
      select {
        min-height: 49px;
        padding: 0 13px;
      }

      textarea {
        padding: 13px;
        resize: vertical;
        line-height: 1.6;
      }

      input:focus,
      select:focus,
      textarea:focus {
        border-color: #0b5137;
        box-shadow:
          0 0 0 3px
          rgba(
            11,
            81,
            55,
            0.07
          );
      }

      .checkbox-card {
        min-height: 70px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 16px;
        border:
          1px
          solid
          #ddd9d0;
        border-radius: 11px;
      }

      .checkbox-card input {
        width: 18px;
        min-height: auto;
        height: 18px;
        accent-color: #0b5137;
      }

      .checkbox-card label {
        display: grid;
        gap: 3px;
        cursor: pointer;
      }

      .checkbox-card strong {
        color: #153a2d;
        font-size: 13px;
      }

      .checkbox-card span {
        color: #7b837e;
        font-size: 11px;
      }

      .upload-area {
        padding: 24px;
        border: 2px dashed #cfd8d2;
        border-radius: 14px;
        background: #f7faf8;
        text-align: center;
      }

      .upload-button {
        width: fit-content;
        min-height: 50px;
        margin: 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        padding: 0 20px;
        border-radius: 10px;
        background: #0b5137;
        color: white;
        font-weight: 850;
        cursor: pointer;
      }

      .upload-button input {
        display: none;
      }

      .upload-area p {
        margin: 10px 0 0;
        color: #77817b;
        font-size: 12px;
      }

      .url-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #8a928d;
        font-size: 11px;
      }

      .url-divider::before,
      .url-divider::after {
        content: '';
        height: 1px;
        flex: 1;
        background: #e1ded5;
      }

      .add-image {
        display: grid;
        grid-template-columns:
          minmax(0, 1fr)
          auto;
        gap: 10px;
      }

      .add-image button {
        min-height: 49px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 0;
        border-radius: 10px;
        padding: 0 16px;
        background: #0b5137;
        color: white;
        font-weight: 800;
        cursor: pointer;
      }

      .images-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              210px,
              1fr
            )
          );
        gap: 14px;
      }

      .image-card {
        overflow: hidden;
        border:
          1px
          solid
          #dedad0;
        border-radius: 13px;
        background: #faf9f5;
      }

      .image-preview {
        position: relative;
        height: 165px;
        background: #ece9e1;
      }

      .image-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .main-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 5px 9px;
        border-radius: 20px;
        background: #0b5137;
        color: white;
        font-size: 11px;
        font-weight: 800;
      }

      .image-actions {
        display: grid;
        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );
        gap: 8px;
        padding: 10px;
      }

      .image-actions button {
        min-height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
      }

      .principal {
        border:
          1px
          solid
          #c9d9d0;
        background: #f0f7f3;
        color: #0b5137;
      }

      .remove-image {
        border:
          1px
          solid
          #f0cfcc;
        background: #fff4f3;
        color: #a23b34;
      }

      .no-images {
        padding: 30px;
        border:
          1px
          dashed
          #d8d4ca;
        border-radius: 12px;
        text-align: center;
        color: #7a837e;
      }

      .save-bar {
        position: sticky;
        bottom: 15px;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content:
          space-between;
        gap: 20px;
        padding: 17px 20px;
        border-radius: 15px;
        background: #084c35;
        color: white;
        box-shadow:
          0 13px 35px
          rgba(
            4,
            53,
            38,
            0.19
          );
      }

      .save-bar > div {
        display: grid;
        gap: 3px;
      }

      .save-bar span {
        color: rgba(
          255,
          255,
          255,
          0.7
        );
        font-size: 12px;
      }

      .save-bar button {
        min-height: 47px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        border-radius: 10px;
        padding: 0 18px;
        background: white;
        color: #084c35;
        font-weight: 850;
        cursor: pointer;
      }

      .save-bar button:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      @media (
        max-width: 900px
      ) {
        .section {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .grid.four {
          grid-template-columns:
            repeat(2, 1fr);
        }
      }

      @media (
        max-width: 650px
      ) {
        .page {
          padding:
            22px
            13px
            80px;
        }

        .topbar {
          align-items:
            flex-start;
          flex-direction:
            column;
        }

        .topbar h1 {
          font-size: 37px;
        }

        .section {
          padding: 21px;
        }

        .grid.two,
        .grid.three,
        .grid.four {
          grid-template-columns: 1fr;
        }

        .upload-button {
          width: 100%;
        }

        .add-image {
          grid-template-columns: 1fr;
        }

        .save-bar {
          align-items: stretch;
          flex-direction: column;
        }
      }
    `}</style>
  );
}