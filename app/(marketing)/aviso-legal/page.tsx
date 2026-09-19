import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import Image from "next/image";
import { PublicMenu } from "@/components/layout/PublicMenu";

export const metadata = { title: "Aviso legal - Designfolio" };

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
        <h1 className="text-3xl font-marcellus mb-8">Aviso legal</h1>
<p className="mb-4 leading-relaxed text-[#4f4f57]"><strong>Última actualización:</strong> 18 de septiembre de 2026</p>
<h2 className="text-xl font-bold mt-10 mb-4">1. Identificación del titular</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">En cumplimiento de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de que el titular de Designfolio es:</p>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Titular:</strong> Jhonny Alberto Duque Pérez</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>NIF/NIE:</strong> Z2855847B</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Domicilio:</strong> 25 de Xullo, 30, piso 5, O Carballiño, Ourense, España</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Correo electrónico de contacto:</strong> jhonnydp78@gmail.com</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5"><strong>Sitio web:</strong> <code className="bg-black/5 px-1.5 py-0.5 rounded text-[13px] font-mono">designfolio.jhonnyduque.com</code></li></ul>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio se encuentra actualmente en fase beta y puede limitar temporalmente el acceso o determinadas funciones mientras se prueba y mejora el servicio.</p>
<h2 className="text-xl font-bold mt-10 mb-4">2. Objeto de Designfolio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio es una plataforma en línea para descubrir, publicar y compartir portafolios y proyectos creativos. Los usuarios pueden crear perfiles, publicar imágenes, vídeos, textos y proyectos, y participar mediante funciones sociales como comentarios y me gusta.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La finalidad de Designfolio es facilitar la exposición y descubrimiento de trabajo creativo. Designfolio no adquiere la propiedad intelectual de los contenidos publicados por los usuarios.</p>
<h2 className="text-xl font-bold mt-10 mb-4">3. Condiciones generales de uso</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Quien utilice Designfolio debe hacerlo de forma lícita y respetando este Aviso legal, los Términos de uso, los derechos de terceros y la legislación aplicable.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">No se permite utilizar el servicio para, entre otras conductas:</p>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">publicar contenidos ilícitos o que vulneren derechos de terceros;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">suplantar a otras personas o atribuirse falsamente la autoría de un trabajo;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">infringir derechos de autor, marcas, derechos de imagen, privacidad u otros derechos;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">acosar, amenazar, discriminar, difamar o perjudicar ilícitamente a otras personas;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">difundir datos personales de terceros sin una base legítima para hacerlo;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">introducir malware, código dañino o intentar comprometer la seguridad del servicio;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">acceder sin autorización a cuentas, sistemas, datos o áreas restringidas;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">manipular artificialmente interacciones, métricas, comentarios o me gusta;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">realizar automatizaciones abusivas o actividades que degraden el funcionamiento de la plataforma.</li></ul>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio podrá limitar, suspender o retirar contenidos o accesos cuando existan indicios razonables de incumplimiento, una reclamación fundada, un riesgo para terceros, un riesgo para la seguridad o una obligación legal.</p>
<h2 className="text-xl font-bold mt-10 mb-4">4. Contenido publicado por los usuarios</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Los usuarios conservan los derechos que les correspondan sobre los contenidos que publiquen.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La publicación en Designfolio no transfiere la propiedad intelectual del contenido a la plataforma. El usuario concede únicamente la licencia limitada necesaria para alojar, procesar técnicamente y mostrar el contenido dentro del servicio, conforme a los Términos de uso.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cada usuario es responsable de aquello que publica, incluidos proyectos, imágenes, vídeos, textos, comentarios y demás contenidos o materiales que incorpore a Designfolio.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Al publicar, el usuario declara que dispone de los derechos, licencias, permisos y autorizaciones necesarios para hacerlo y que el contenido no vulnera derechos de terceros ni la legislación aplicable.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio no certifica la autoría, originalidad, licitud, veracidad o titularidad de cada contenido por el mero hecho de que este aparezca publicado en la plataforma.</p>
<h2 className="text-xl font-bold mt-10 mb-4">5. Propiedad intelectual e industrial de Designfolio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Salvo el contenido aportado por los usuarios o los elementos pertenecientes a terceros, los derechos sobre el software, interfaz, estructura, textos propios, recursos gráficos y demás componentes originales de Designfolio corresponden a su titular o se utilizan con la autorización correspondiente.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">No se concede ninguna licencia sobre esos elementos salvo la estrictamente necesaria para utilizar el servicio conforme a sus condiciones.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">No pueden reproducirse, distribuirse, transformarse, explotarse o reutilizarse fuera de los límites permitidos por la ley o sin la autorización del titular correspondiente.</p>
<h2 className="text-xl font-bold mt-10 mb-4">6. Moderación</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio puede realizar revisiones manuales o técnicas para comprobar el cumplimiento básico de las normas de la comunidad. La existencia de moderación no implica una revisión previa permanente de todo el contenido ni constituye una certificación de autoría, calidad, legalidad, originalidad o veracidad.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio puede archivar, limitar la visibilidad, bloquear el acceso o eliminar contenidos, así como limitar o desactivar cuentas, cuando exista un incumplimiento de las normas, una reclamación suficientemente fundamentada, un riesgo para terceros o una obligación legal.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cuando proceda conforme a la normativa aplicable, se informará al usuario afectado de la medida adoptada y de sus motivos.</p>
<h2 className="text-xl font-bold mt-10 mb-4">7. Notificación de contenidos ilícitos o vulneraciones de derechos</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cualquier persona puede comunicar la existencia de un contenido concreto que considere ilícito o lesivo de sus derechos escribiendo a <strong>jhonnydp78@gmail.com</strong> e indicando, en la medida de lo posible:</p>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">la URL o localización exacta del contenido;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">una explicación suficientemente clara del motivo de la reclamación;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">los datos necesarios para poder contactar con la persona que presenta la notificación;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">cuando corresponda, la documentación o información que permita acreditar el derecho invocado;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">una declaración de buena fe de que la información facilitada es exacta y completa según su conocimiento.</li></ul>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio analizará las notificaciones de forma diligente y podrá retirar o bloquear el acceso al contenido cuando corresponda conforme a la legislación aplicable y a sus Términos de uso.</p>
<h2 className="text-xl font-bold mt-10 mb-4">8. Disponibilidad y funcionamiento</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio se encuentra en fase beta. Pueden existir cambios, interrupciones, errores o funciones en desarrollo.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Se adoptarán medidas razonables para mantener el servicio disponible y seguro, pero no se garantiza un funcionamiento ininterrumpido o completamente libre de errores.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">El titular no será responsable de interrupciones o daños que no le sean imputables, incluidos los derivados de fallos de redes, proveedores externos, dispositivos del usuario, actuaciones de terceros o causas de fuerza mayor, sin perjuicio de las responsabilidades que legalmente no puedan excluirse.</p>
<h2 className="text-xl font-bold mt-10 mb-4">9. Contenido y servicios de terceros</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Los usuarios pueden publicar contenidos o referencias relacionadas con terceros. Designfolio no respalda automáticamente esos contenidos ni garantiza su exactitud.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cuando el sitio incluya enlaces o integraciones con servicios externos, estos se regirán también por sus propias condiciones y políticas. Designfolio no controla sus contenidos, disponibilidad ni prácticas de privacidad salvo en aquello que legalmente le resulte exigible.</p>
<h2 className="text-xl font-bold mt-10 mb-4">10. Protección de datos y cookies</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">El tratamiento de datos personales se describe en la <strong>Política de privacidad</strong> de Designfolio.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">El uso de cookies y tecnologías equivalentes se explica en la <strong>Política de cookies</strong>.</p>
<h2 className="text-xl font-bold mt-10 mb-4">11. Legislación aplicable y jurisdicción</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Este sitio, este Aviso legal y las relaciones derivadas del uso de Designfolio se rigen por la legislación española y por la normativa de la Unión Europea que resulte aplicable.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Las controversias se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable. Cuando el usuario tenga la condición de consumidor o exista un fuero imperativo, prevalecerá el que establezca la legislación correspondiente.</p>
<h2 className="text-xl font-bold mt-10 mb-4">12. Contacto</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Para cuestiones relacionadas con este Aviso legal o con el funcionamiento jurídico de Designfolio puedes escribir a <strong>jhonnydp78@gmail.com</strong>.<br/></p>
      </div>
      <PublicFooter />
    </main>
  );
}
