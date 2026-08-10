"use client";

import { useCallback, useState } from "react";
import BasicInfo from "../../components/form/BasicInfo";
import GoogleAddressMap from "../../components/GoogleAddressMap";
import { regionesChile } from "../../data/regiones";
import { supabase } from "../../lib/supabase";

const TIPOS_TERRENO = ["Terreno", "Parcela", "Campo"];
const MAX_IMAGENES = 15;
const MAX_TAMANO_IMAGEN = 10 * 1024 * 1024;

const initialForm = {
  titulo: "",
  descripcion: "",
  operacion: "Venta",
  tipo: "Terreno",

  moneda: "CLP",
  precio: "",

  region: "",
  comuna: "",
  direccion: "",

  latitud: null,
  longitud: null,
  google_place_id: null,

  superficie_total: "",
  unidad_superficie: "m2",

  factibilidad_agua: "por_confirmar",
  factibilidad_luz: "por_confirmar",

  dormitorios: "",
  banos: "",
  estacionamientos: "",

  video_youtube: "",

  nombre_contacto: "",
  telefono_contacto: "",
  email_contacto: "",

  imagenes: [],
};

export default function PublicarPropiedad() {
  const [form, setForm] = useState(initialForm);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState("");

  const esTerreno = TIPOS_TERRENO.includes(form.tipo);
  const comunas = form.region
    ? regionesChile[form.region] ?? []
    : [];

  function actualizarCampo({ target: { name, value } }) {
    setForm((actual) => ({
      ...actual,
      [name]: value,

      ...(name === "region"
        ? {
            comuna: "",
          }
        : {}),

      ...(name === "tipo" && TIPOS_TERRENO.includes(value)
        ? {
            dormitorios: "",
            banos: "",
            estacionamientos: "",
          }
        : {}),
    }));
  }

  const actualizarUbicacion = useCallback((ubicacion) => {
    setForm((actual) => ({
      ...actual,
      ...ubicacion,
    }));
  }, []);

  function actualizarImagenes(event) {
    const archivos = Array.from(event.target.files || []);

    setForm((actual) => ({
      ...actual,
      imagenes: archivos,
    }));
  }

  function validarFormulario() {
    if (!form.titulo.trim()) {
      throw new Error("Ingresa un título.");
    }

    if (!form.descripcion.trim()) {
      throw new Error("Ingresa una descripción.");
    }

    if (!form.precio || Number(form.precio) <= 0) {
      throw new Error("Ingresa un precio válido.");
    }

    if (!form.region) {
      throw new Error("Selecciona una región.");
    }

    if (!form.comuna) {
      throw new Error("Selecciona una comuna.");
    }

    if (form.latitud == null || form.longitud == null) {
      throw new Error("Selecciona una ubicación en el mapa.");
    }

    if (!form.nombre_contacto.trim()) {
      throw new Error("Ingresa el nombre de contacto.");
    }

    if (!form.telefono_contacto.trim()) {
      throw new Error("Ingresa el teléfono o WhatsApp.");
    }
  }

  function validarImagenes(imagenes) {
    if (!imagenes || imagenes.length === 0) {
      throw new Error("Agrega al menos una fotografía.");
    }

    if (imagenes.length > MAX_IMAGENES) {
      throw new Error(
        `Puedes subir un máximo de ${MAX_IMAGENES} fotografías.`
      );
    }

    imagenes.forEach((archivo) => {
      if (!archivo.type?.startsWith("image/")) {
        throw new Error(
          `El archivo "${archivo.name}" no es una imagen.`
        );
      }

      if (archivo.size > MAX_TAMANO_IMAGEN) {
        throw new Error(
          `La imagen "${archivo.name}" supera el máximo de 10 MB.`
        );
      }
    });
  }

  async function subirImagenes(imagenes) {
    const carpeta = crypto.randomUUID();
    const urls = [];
    const rutasSubidas = [];

    try {
      for (
        let indice = 0;
        indice < imagenes.length;
        indice += 1
      ) {
        const archivo = imagenes[indice];

        const extension =
          archivo.name.split(".").pop()?.toLowerCase() || "jpg";

        const nombreSeguro = archivo.name
          .replace(/\.[^/.]+$/, "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 60);

        const numero = String(indice + 1).padStart(2, "0");

        const ruta =
          `${carpeta}/${numero}-` +
          `${nombreSeguro || "imagen"}.${extension}`;

        const { error: errorSubida } = await supabase.storage
          .from("propiedades")
          .upload(ruta, archivo, {
            cacheControl: "3600",
            upsert: false,
            contentType: archivo.type,
          });

        if (errorSubida) {
          throw new Error(
            `No fue posible subir "${archivo.name}": ${errorSubida.message}`
          );
        }

        rutasSubidas.push(ruta);

        const { data: datosUrl } = supabase.storage
          .from("propiedades")
          .getPublicUrl(ruta);

        if (!datosUrl?.publicUrl) {
          throw new Error(
            `No fue posible obtener la URL pública de "${archivo.name}".`
          );
        }

        urls.push(datosUrl.publicUrl);
      }

      return {
        urls,
        rutasSubidas,
      };
    } catch (error) {
      if (rutasSubidas.length > 0) {
        await supabase.storage
          .from("propiedades")
          .remove(rutasSubidas);
      }

      throw error;
    }
  }

  async function publicar(event) {
    event.preventDefault();

    setEnviando(true);
    setMensaje("");
    setMensajeTipo("");

    let rutasSubidas = [];

    try {
      validarFormulario();
      validarImagenes(form.imagenes);

      const resultadoImagenes = await subirImagenes(
        form.imagenes
      );

      rutasSubidas = resultadoImagenes.rutasSubidas;

      const registro = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),

        operacion: form.operacion,
        tipo: form.tipo,

        moneda: form.moneda,
        precio: Number(form.precio),

        region: form.region,
        comuna: form.comuna,
        direccion: form.direccion || null,

        latitud: form.latitud,
        longitud: form.longitud,
        google_place_id: form.google_place_id || null,

        superficie_total: form.superficie_total
          ? Number(form.superficie_total)
          : null,

        unidad_superficie: form.unidad_superficie,

        factibilidad_agua: esTerreno
          ? form.factibilidad_agua
          : "por_confirmar",

        factibilidad_luz: esTerreno
          ? form.factibilidad_luz
          : "por_confirmar",

        dormitorios:
          !esTerreno && form.dormitorios
            ? Number(form.dormitorios)
            : null,

        banos:
          !esTerreno && form.banos
            ? Number(form.banos)
            : null,

        estacionamientos:
          !esTerreno && form.estacionamientos
            ? Number(form.estacionamientos)
            : null,

        video_youtube:
          form.video_youtube.trim() || null,

        nombre_contacto:
          form.nombre_contacto.trim(),

        telefono_contacto:
          form.telefono_contacto.trim(),

        email_contacto:
          form.email_contacto.trim() || null,

        imagenes: resultadoImagenes.urls,

        estado: "pendiente",
      };

      const { error: errorRegistro } = await supabase
        .from("propiedades")
        .insert([registro]);

      if (errorRegistro) {
        throw new Error(errorRegistro.message);
      }

      setMensaje(
        "Propiedad enviada correctamente con sus fotografías. Quedó pendiente de revisión."
      );

      setMensajeTipo("exito");
      setForm({ ...initialForm });

    } catch (error) {
      console.error(error);

      if (rutasSubidas.length > 0) {
        await supabase.storage
          .from("propiedades")
          .remove(rutasSubidas);
      }

      setMensaje(
        `No fue posible publicar: ${
          error instanceof Error
            ? error.message
            : "Error desconocido."
        }`
      );

      setMensajeTipo("error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main style={s.main}>
      <section style={s.header}>
        <a href="/" style={s.back}>
          ← Volver al inicio
        </a>

        <p style={s.eyebrow}>
          Publica en Hecta
        </p>

        <h1 style={s.title}>
          Publicar una propiedad
        </h1>

        <p style={s.subtitle}>
          Completa los datos, selecciona la ubicación y
          envía tu propiedad para revisión.
        </p>
      </section>

      <form onSubmit={publicar} style={s.form}>
        <BasicInfo
          form={form}
          onChange={actualizarCampo}
        />

        <Section title="Precio y superficie">
          <div style={s.grid3}>
            <Select
              label="Moneda"
              name="moneda"
              value={form.moneda}
              onChange={actualizarCampo}
              options={[
                ["CLP", "Pesos chilenos ($)"],
                ["UF", "UF"],
              ]}
            />

            <Input
              required
              type="number"
              min="0"
              label="Precio"
              name="precio"
              value={form.precio}
              onChange={actualizarCampo}
            />

            <label style={s.label}>
              Superficie

              <div style={s.surfaceRow}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="superficie_total"
                  value={form.superficie_total}
                  onChange={actualizarCampo}
                  style={{
                    ...s.input,
                    flex: 1,
                  }}
                />

                <select
                  name="unidad_superficie"
                  value={form.unidad_superficie}
                  onChange={actualizarCampo}
                  style={{
                    ...s.input,
                    width: 105,
                  }}
                >
                  <option value="m2">
                    m²
                  </option>

                  <option value="ha">
                    ha
                  </option>
                </select>
              </div>
            </label>
          </div>
        </Section>

        <Section title="Ubicación">
          <div style={s.grid2}>
            <Select
              label="Región"
              name="region"
              value={form.region}
              onChange={actualizarCampo}
              required
              options={[
                ["", "Selecciona una región"],

                ...Object.keys(regionesChile).map(
                  (region) => [region, region]
                ),
              ]}
            />

            <Select
              label="Comuna"
              name="comuna"
              value={form.comuna}
              onChange={actualizarCampo}
              required
              disabled={!form.region}
              options={[
                ["", "Selecciona una comuna"],

                ...comunas.map((comuna) => [
                  comuna,
                  comuna,
                ]),
              ]}
            />
          </div>

          <GoogleAddressMap
            onPlaceSelected={actualizarUbicacion}
          />

          {form.direccion && (
            <p style={s.address}>
              <strong>
                Ubicación seleccionada:
              </strong>{" "}
              {form.direccion}
            </p>
          )}
        </Section>

        {esTerreno ? (
          <Section title="Factibilidades">
            <div style={s.grid2}>
              <Choice
                label="Factibilidad de agua"
                name="factibilidad_agua"
                value={form.factibilidad_agua}
                onChange={actualizarCampo}
              />

              <Choice
                label="Factibilidad eléctrica"
                name="factibilidad_luz"
                value={form.factibilidad_luz}
                onChange={actualizarCampo}
              />
            </div>
          </Section>
        ) : (
          <Section title="Características">
            <div style={s.grid3}>
              <Input
                type="number"
                min="0"
                label="Dormitorios"
                name="dormitorios"
                value={form.dormitorios}
                onChange={actualizarCampo}
              />

              <Input
                type="number"
                min="0"
                label="Baños"
                name="banos"
                value={form.banos}
                onChange={actualizarCampo}
              />

              <Input
                type="number"
                min="0"
                label="Estacionamientos"
                name="estacionamientos"
                value={form.estacionamientos}
                onChange={actualizarCampo}
              />
            </div>
          </Section>
        )}

        <Section title="Fotografías">
          <label style={s.label}>
            Selecciona entre 1 y 15 fotografías

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={actualizarImagenes}
              style={s.fileInput}
            />
          </label>

          <p style={s.helpText}>
            Cada imagen puede pesar hasta 10 MB.
          </p>

          {form.imagenes.length > 0 && (
            <>
              <p style={s.selectedText}>
                {form.imagenes.length} fotografía(s)
                seleccionada(s)
              </p>

              <div style={s.previewGrid}>
                {form.imagenes.map((imagen, index) => (
                  <div
                    key={`${imagen.name}-${index}`}
                    style={s.previewCard}
                  >
                    <img
                      src={URL.createObjectURL(imagen)}
                      alt={`Vista previa ${index + 1}`}
                      style={s.previewImage}
                    />

                    <span style={s.previewName}>
                      {imagen.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        <Section title="Video">
          <Input
            type="url"
            label="Enlace de YouTube"
            name="video_youtube"
            value={form.video_youtube}
            onChange={actualizarCampo}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Section>

        <Section title="Contacto">
          <div style={s.grid2}>
            <Input
              required
              label="Nombre"
              name="nombre_contacto"
              value={form.nombre_contacto}
              onChange={actualizarCampo}
            />

            <Input
              required
              label="Teléfono o WhatsApp"
              name="telefono_contacto"
              value={form.telefono_contacto}
              onChange={actualizarCampo}
            />
          </div>

          <Input
            type="email"
            label="Email"
            name="email_contacto"
            value={form.email_contacto}
            onChange={actualizarCampo}
          />
        </Section>

        {mensaje && (
          <p
            style={{
              ...s.message,

              ...(mensajeTipo === "error"
                ? s.messageError
                : s.messageSuccess),
            }}
          >
            {mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          style={{
            ...s.submit,

            ...(enviando
              ? s.submitDisabled
              : {}),
          }}
        >
          {enviando
            ? "Subiendo y enviando..."
            : "Enviar propiedad para revisión"}
        </button>
      </form>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section style={s.section}>
      <h2 style={s.sectionTitle}>
        {title}
      </h2>

      {children}
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <label style={s.label}>
      {label}

      <input
        {...props}
        style={s.input}
      />
    </label>
  );
}

function Select({
  label,
  options,
  ...props
}) {
  return (
    <label style={s.label}>
      {label}

      <select
        {...props}
        style={s.input}
      >
        {options.map((option) => {
          const [value, text] =
            Array.isArray(option)
              ? option
              : [option, option];

          return (
            <option
              key={value}
              value={value}
            >
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Choice({
  label,
  name,
  value,
  onChange,
}) {
  const opciones = [
    ["si", "Sí"],
    ["no", "No"],
    ["por_confirmar", "Por confirmar"],
  ];

  return (
    <fieldset style={s.fieldset}>
      <legend style={s.legend}>
        {label}
      </legend>

      {opciones.map(
        ([optionValue, text]) => (
          <label
            key={optionValue}
            style={s.radio}
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={onChange}
            />

            {text}
          </label>
        )
      )}
    </fieldset>
  );
}

const s = {
  main: {
    minHeight: "100vh",
    padding: "48px 20px 80px",
    background: "#f6f4ee",
    color: "#0c3c2b",
  },

  header: {
    maxWidth: 900,
    margin: "0 auto 28px",
  },

  back: {
    color: "#0c5139",
    textDecoration: "none",
    fontWeight: 700,
  },

  eyebrow: {
    marginTop: 36,
    marginBottom: 8,
    color: "#ad8230",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: ".12em",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    fontSize: "clamp(36px,6vw,62px)",
    lineHeight: 1.05,
  },

  subtitle: {
    maxWidth: 680,
    color: "#5b675f",
    fontSize: 17,
    lineHeight: 1.6,
  },

  form: {
    maxWidth: 900,
    margin: "0 auto",
  },

  section: {
    marginBottom: 20,
    padding: 28,
    border: "1px solid #dedbd1",
    borderRadius: 20,
    background: "#fff",
    boxShadow:
      "0 10px 28px rgba(18,59,42,.06)",
  },

  sectionTitle: {
    margin: "0 0 22px",
    fontSize: 22,
  },

  label: {
    display: "grid",
    gap: 8,
    marginBottom: 18,
    fontSize: 14,
    fontWeight: 750,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d6d8d3",
    borderRadius: 12,
    background: "#fff",
    fontSize: 16,
  },

  grid2: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: 18,
  },

  grid3: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: 18,
  },

  surfaceRow: {
    display: "flex",
    gap: 10,
  },

  fieldset: {
    margin: 0,
    padding: 18,
    border: "1px solid #d6d8d3",
    borderRadius: 12,
  },

  legend: {
    padding: "0 8px",
    fontWeight: 800,
  },

  radio: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginTop: 10,
  },

  address: {
    padding: 14,
    borderRadius: 12,
    background: "#eef8f2",
  },

  fileInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: 16,
    border: "2px dashed #aebdb4",
    borderRadius: 12,
    background: "#f8fbf9",
    cursor: "pointer",
  },

  helpText: {
    marginTop: -8,
    color: "#66736b",
    fontSize: 14,
  },

  selectedText: {
    fontWeight: 800,
    color: "#0c5139",
  },

  previewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(145px,1fr))",
    gap: 14,
    marginTop: 16,
  },

  previewCard: {
    overflow: "hidden",
    border: "1px solid #d6d8d3",
    borderRadius: 12,
    background: "#fff",
  },

  previewImage: {
    display: "block",
    width: "100%",
    height: 110,
    objectFit: "cover",
  },

  previewName: {
    display: "block",
    padding: 10,
    overflow: "hidden",
    color: "#405048",
    fontSize: 12,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  message: {
    padding: 16,
    borderRadius: 12,
  },

  messageSuccess: {
    background: "#eef8f2",
    color: "#145536",
  },

  messageError: {
    background: "#fff0f0",
    color: "#9b2525",
  },

  submit: {
    width: "100%",
    padding: "17px 24px",
    border: 0,
    borderRadius: 14,
    background: "#075137",
    color: "#fff",
    fontSize: 17,
    fontWeight: 800,
    cursor: "pointer",
  },

  submitDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
};