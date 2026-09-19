import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import Image from "next/image";
import { PublicMenu } from "@/components/layout/PublicMenu";

export const metadata = { title: "Política de privacidad - Designfolio" };

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1500px] px-6 md:px-10">
          <div className="mx-auto flex h-14 w-full max-w-[935px] items-center justify-between">
            <Link href="/" aria-label="Designfolio" className="inline-flex items-center">
              <Image src="/brand/simbolo-logo.webp" alt="Designfolio" width={36} height={36} className="h-9 w-9 object-contain" />
            </Link>
            <PublicMenu sesion={null} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[700px] px-6 py-12 md:py-20">
        <h1 className="text-page-title mb-8">Política de privacidad</h1>
<p className="mb-4 text-body text-[#4f4f57]"><strong>Última actualización:</strong> 18 de septiembre de 2026</p>
<h2 className="text-section mt-10 mb-4">1. Responsable del tratamiento</h2>
<p className="mb-4 text-body text-[#4f4f57]">Designfolio, disponible en <code className="bg-black/5 px-1.5 py-0.5 rounded text-body-sm font-mono">designfolio.jhonnyduque.com</code>, es una plataforma en línea en la que estudiantes, diseñadores emergentes y otras personas creadoras pueden publicar y compartir proyectos de portafolio.</p>
<p className="mb-4 text-body text-[#4f4f57]">El responsable del tratamiento de los datos personales es:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Titular:</strong> Jhonny Alberto Duque Pérez</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>NIF/NIE:</strong> Z2855847B</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Domicilio:</strong> 25 de Xullo, 30, piso 5, O Carballiño, Ourense, España</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Correo de contacto para privacidad y ejercicio de derechos:</strong> jhonnydp78@gmail.com</li></ul>
<h2 className="text-section mt-10 mb-4">2. Qué datos tratamos</h2>
<h3 className="text-subsection mt-8 mb-3">2.1. Datos de cuenta y perfil</h3>
<p className="mb-4 text-body text-[#4f4f57]">Cuando te registras o utilizas Designfolio podemos tratar, según las funciones que utilices:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">correo electrónico;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">credenciales de acceso almacenadas mediante sistemas criptográficos adecuados, cuando proceda;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">nombre y apellidos;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">nombre de usuario;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">biografía;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">foto de perfil;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">universidad, escuela o información académica que decidas facilitar;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">curso, año o etapa formativa;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">especialidades o áreas creativas;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">fecha de alta y datos básicos de gestión de la cuenta.</li></ul>
<p className="mb-4 text-body text-[#4f4f57]">Si eliges iniciar sesión con Google, Designfolio recibe los datos de autenticación que Google comunique conforme a los permisos mostrados durante ese proceso.</p>
<h3 className="text-subsection mt-8 mb-3">2.2. Contenido y actividad</h3>
<p className="mb-4 text-body text-[#4f4f57]">Tratamos la información que publicas o generas en la plataforma, entre ella:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">títulos y descripciones de proyectos;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">imágenes y vídeos;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">comentarios;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">me gusta y otras interacciones;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">fechas asociadas a publicaciones e interacciones;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">datos necesarios para ordenar, mostrar y relacionar el contenido dentro de la plataforma.</li></ul>
<h3 className="text-subsection mt-8 mb-3">2.3. Datos técnicos y de seguridad</h3>
<p className="mb-4 text-body text-[#4f4f57]">Podemos tratar datos técnicos necesarios para prestar y proteger el servicio, como:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">dirección IP;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">información básica de sesión y autenticación;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">registros técnicos de errores, seguridad y prevención de abuso;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">identificadores técnicos necesarios para evitar interacciones duplicadas o usos automatizados abusivos.</li></ul>
<p className="mb-4 text-body text-[#4f4f57]">No utilizamos estos datos para crear perfiles publicitarios ni para publicidad comportamental.</p>
<h3 className="text-subsection mt-8 mb-3">2.4. Moderación, denuncias y reclamaciones</h3>
<p className="mb-4 text-body text-[#4f4f57]">Cuando se realizan acciones de moderación o se recibe una denuncia, podemos conservar información relativa a:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">el contenido afectado;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">la acción adoptada;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">la fecha de la actuación;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">la cuenta afectada;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">la persona que realizó la moderación, cuando proceda;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">la explicación, reclamación o documentación aportada por quien comunica una posible infracción.</li></ul>
<h2 className="text-section mt-10 mb-4">3. Para qué usamos los datos y cuál es la base jurídica</h2>
<p className="mb-4 text-body text-[#4f4f57]">| Tratamiento | Finalidad | Base jurídica principal |<br/>| --- | --- | --- |<br/>| Datos esenciales de cuenta y credenciales | Crear y gestionar tu cuenta y permitirte utilizar Designfolio | Ejecución de la relación contigo, art. 6.1.b RGPD |<br/>| Datos de perfil | Mostrar y gestionar tu perfil dentro de la comunidad | Ejecución de la relación contigo, art. 6.1.b RGPD |<br/>| Proyectos, imágenes, vídeos, comentarios e interacciones | Permitir las funciones de publicación, descubrimiento e interacción | Ejecución de la relación contigo, art. 6.1.b RGPD |<br/>| Verificaciones y comunicaciones necesarias del servicio | Seguridad, autenticación y avisos imprescindibles | Art. 6.1.b RGPD y, cuando proceda, interés legítimo del art. 6.1.f RGPD |<br/>| Dirección IP y registros técnicos | Prevenir abuso, fraude, ataques y usos que perjudiquen la plataforma o a terceros | Interés legítimo en proteger la seguridad e integridad del servicio, art. 6.1.f RGPD |<br/>| Moderación y gestión de denuncias | Aplicar las normas, proteger derechos de terceros y cumplir obligaciones legales | Interés legítimo, art. 6.1.f RGPD, y obligación legal cuando corresponda, art. 6.1.c RGPD |<br/>| Inicio de sesión con Google | Facilitar un método alternativo de autenticación si lo eliges | Ejecución de la relación contigo, art. 6.1.b RGPD |<br/>| Funciones opcionales que requieran autorización específica | La finalidad que se indique antes de activarlas | Consentimiento, art. 6.1.a RGPD |</p>
<p className="mb-4 text-body text-[#4f4f57]">Cuando el tratamiento se base en interés legítimo, se limitará a lo necesario para la finalidad indicada teniendo en cuenta los derechos e intereses de las personas afectadas.</p>
<h2 className="text-section mt-10 mb-4">4. Contenido público y datos de terceros</h2>
<p className="mb-4 text-body text-[#4f4f57]">Los perfiles y proyectos que se publiquen con visibilidad pública pueden ser accesibles a través de Internet y ser vistos por personas que no tengan una cuenta en Designfolio.</p>
<p className="mb-4 text-body text-[#4f4f57]">Si publicas imágenes, vídeos, textos u otros materiales que contengan datos personales de terceras personas, eres responsable de disponer de una base legítima, autorización o permiso suficiente cuando sea necesario.</p>
<p className="mb-4 text-body text-[#4f4f57]">Designfolio puede retirar o limitar el acceso a contenido cuando exista una reclamación fundada, una vulneración de derechos o una obligación legal.</p>
<h2 className="text-section mt-10 mb-4">5. Destinatarios y proveedores</h2>
<p className="mb-4 text-body text-[#4f4f57]">Designfolio no vende datos personales ni los cede a terceros para publicidad.</p>
<p className="mb-4 text-body text-[#4f4f57]">Para prestar el servicio pueden intervenir proveedores tecnológicos que actúan como encargados o proveedores independientes según el servicio concreto, entre ellos:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">proveedores de alojamiento e infraestructura, actualmente <strong>Hostinger</strong>;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Google</strong>, únicamente cuando eliges utilizar su sistema de autenticación;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">proveedores de correo transaccional necesarios para verificaciones, avisos y seguridad;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">otros proveedores técnicos estrictamente necesarios para alojar, proteger o mantener la plataforma.</li></ul>
<p className="mb-4 text-body text-[#4f4f57]">Solo se facilitan los datos necesarios para la prestación del servicio correspondiente y se aplican las garantías contractuales y legales que resulten exigibles.</p>
<h2 className="text-section mt-10 mb-4">6. Transferencias internacionales</h2>
<p className="mb-4 text-body text-[#4f4f57]">Algunos proveedores tecnológicos pueden tratar datos desde países situados fuera del Espacio Económico Europeo.</p>
<p className="mb-4 text-body text-[#4f4f57]">Cuando exista una transferencia internacional de datos, se aplicará un mecanismo válido conforme al capítulo V del RGPD, como una decisión de adecuación, cláusulas contractuales tipo u otra garantía reconocida por la normativa aplicable.</p>
<p className="mb-4 text-body text-[#4f4f57]">Puedes solicitar información adicional sobre las garantías utilizadas escribiendo a <strong>jhonnydp78@gmail.com</strong>.</p>
<h2 className="text-section mt-10 mb-4">7. Durante cuánto tiempo conservamos los datos</h2>
<p className="mb-4 text-body text-[#4f4f57]">Los datos se conservarán durante el tiempo necesario para las finalidades para las que fueron recogidos y, posteriormente, durante los plazos que puedan resultar necesarios para cumplir obligaciones legales, proteger la seguridad o formular, ejercer o defender reclamaciones.</p>
<p className="mb-4 text-body text-[#4f4f57]">Como criterios generales:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>datos de cuenta y perfil:</strong> mientras la cuenta permanezca activa y durante el periodo técnico necesario para completar su cierre;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>proyectos, imágenes y vídeos:</strong> mientras permanezcan publicados o hasta que sean eliminados por el usuario, por cierre de cuenta o por moderación;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>comentarios e interacciones:</strong> mientras permanezcan vinculados a la actividad de la cuenta o hasta que sean eliminados o desvinculados conforme al funcionamiento del servicio;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>datos técnicos y de seguridad:</strong> durante el periodo razonablemente necesario para detectar, prevenir o investigar abusos e incidentes;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>registros de moderación y reclamaciones:</strong> durante el tiempo necesario para gestionar la incidencia y, cuando proceda, durante los plazos aplicables a posibles responsabilidades;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>copias de seguridad:</strong> hasta su sobrescritura o eliminación dentro del ciclo técnico de copias de seguridad.</li></ul>
<p className="mb-4 text-body text-[#4f4f57]">Los datos que deban conservarse para atender responsabilidades podrán mantenerse bloqueados o limitados a esa finalidad durante el plazo legal aplicable.</p>
<h2 className="text-section mt-10 mb-4">8. Cierre y eliminación de la cuenta</h2>
<p className="mb-4 text-body text-[#4f4f57]">Puedes solicitar el cierre de tu cuenta utilizando la opción disponible dentro de Designfolio cuando exista o escribiendo a <strong>jhonnydp78@gmail.com</strong> desde la dirección vinculada a la cuenta.</p>
<p className="mb-4 text-body text-[#4f4f57]">Al cerrar la cuenta se iniciará el proceso de eliminación o desvinculación de los datos y contenidos asociados, salvo la información que deba mantenerse temporalmente por obligaciones legales, seguridad, prevención de fraude o defensa frente a reclamaciones.</p>
<p className="mb-4 text-body text-[#4f4f57]">La eliminación visible de un contenido puede producirse antes de que desaparezcan todas sus copias técnicas o de seguridad.</p>
<h2 className="text-section mt-10 mb-4">9. Tus derechos</h2>
<p className="mb-4 text-body text-[#4f4f57]">Puedes ejercer, cuando proceda, los derechos reconocidos por la normativa de protección de datos, entre ellos:</p>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>acceso</strong> a tus datos personales;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>rectificación</strong> de datos inexactos;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>supresión</strong> cuando se cumplan los requisitos legales;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>oposición</strong> a tratamientos basados en interés legítimo por motivos relacionados con tu situación particular;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>limitación</strong> del tratamiento en los casos previstos por la ley;</li></ul>
<ul className="mb-6 text-body text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>portabilidad</strong> de los datos cuando legalmente corresponda.</li></ul>
<p className="mb-4 text-body text-[#4f4f57]">Si un tratamiento se basa en tu consentimiento, puedes retirarlo en cualquier momento sin afectar a la licitud del tratamiento realizado anteriormente.</p>
<p className="mb-4 text-body text-[#4f4f57]">Para ejercer tus derechos escribe a <strong>jhonnydp78@gmail.com</strong> indicando el derecho que deseas ejercer y la información razonablemente necesaria para identificar la cuenta o verificar tu identidad cuando sea preciso.</p>
<h2 className="text-section mt-10 mb-4">10. Menores de edad</h2>
<p className="mb-4 text-body text-[#4f4f57]">Designfolio aplicará las garantías adicionales que correspondan cuando trate datos personales de menores. En España, cuando un tratamiento se base en el consentimiento del propio menor, la normativa permite que este lo preste por sí mismo a partir de los catorce años, sin perjuicio de los supuestos en los que otra norma exija asistencia o autorización de sus representantes legales.</p>
<p className="mb-4 text-body text-[#4f4f57]">La plataforma podrá establecer requisitos de edad adicionales para determinadas funciones o para la creación de cuentas.</p>
<h2 className="text-section mt-10 mb-4">11. Reclamaciones ante la AEPD</h2>
<p className="mb-4 text-body text-[#4f4f57]">Si consideras que el tratamiento de tus datos vulnera la normativa, puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>.</p>
<p className="mb-4 text-body text-[#4f4f57]">Antes de reclamar por la falta de atención de un derecho, deberás haberlo ejercido previamente ante el responsable en los términos previstos por la normativa.</p>
<h2 className="text-section mt-10 mb-4">12. Seguridad</h2>
<p className="mb-4 text-body text-[#4f4f57]">Aplicamos medidas técnicas y organizativas razonables destinadas a proteger los datos frente a accesos no autorizados, pérdida, alteración o divulgación indebida.</p>
<p className="mb-4 text-body text-[#4f4f57]">Ningún sistema conectado a Internet puede garantizar una seguridad absoluta. Si detectas un problema de seguridad relacionado con tu cuenta o con Designfolio, puedes comunicarlo a <strong>jhonnydp78@gmail.com</strong>.</p>
<h2 className="text-section mt-10 mb-4">13. Cambios en esta política</h2>
<p className="mb-4 text-body text-[#4f4f57]">Podemos actualizar esta Política de privacidad cuando cambien las funcionalidades, los proveedores o las obligaciones legales aplicables.</p>
<p className="mb-4 text-body text-[#4f4f57]">La versión vigente mostrará siempre su fecha de última actualización. Cuando un cambio afecte de forma relevante a la manera en que tratamos datos personales, se comunicará de forma adecuada cuando la normativa lo exija.<br/></p>
      </div>
      <PublicFooter />
    </main>
  );
}
