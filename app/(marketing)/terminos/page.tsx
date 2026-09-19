import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import Image from "next/image";
import { PublicMenu } from "@/components/layout/PublicMenu";

export const metadata = { title: "Términos de uso - Designfolio" };

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
        <h1 className="text-3xl font-marcellus mb-8">Términos de uso</h1>
<p className="mb-4 leading-relaxed text-[#4f4f57]"><strong>Última actualización:</strong> 18 de septiembre de 2026</p>
<h2 className="text-xl font-bold mt-10 mb-4">1. Sobre Designfolio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio, disponible en <code className="bg-black/5 px-1.5 py-0.5 rounded text-[13px] font-mono">designfolio.jhonnyduque.com</code>, es una plataforma en línea orientada a estudiantes, diseñadores emergentes y otras personas creadoras para publicar proyectos de portafolio, descubrir trabajo creativo e interactuar con otros usuarios.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">El servicio es gestionado por <strong>Jhonny Alberto Duque Pérez</strong>, con domicilio en 25 de Xullo, 30, piso 5, O Carballiño, Ourense, España, y correo de contacto <strong>jhonnydp78@gmail.com</strong>.</p>
<h2 className="text-xl font-bold mt-10 mb-4">2. Aceptación de los términos</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Al crear una cuenta o utilizar funciones que requieran registro aceptas estos Términos de uso y te comprometes a respetarlos.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Si no estás de acuerdo con ellos, no debes crear una cuenta ni utilizar las funciones que requieran su aceptación.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">El uso de Designfolio exige capacidad legal suficiente para aceptar estos términos. Cuando la legislación aplicable requiera autorización o intervención de representantes legales por razón de edad o capacidad, deberá contarse con ella.</p>
<h2 className="text-xl font-bold mt-10 mb-4">3. Acceso y cuentas</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio puede limitar temporalmente el acceso mediante invitación u otros mecanismos durante la fase beta.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La existencia de una invitación o de una cuenta no genera un derecho permanente de acceso. El acceso puede limitarse o suspenderse cuando exista fraude, abuso, incumplimiento de estos Términos, un riesgo para la seguridad, una reclamación fundada o una obligación legal.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Debes facilitar información veraz, mantenerla razonablemente actualizada y proteger tus credenciales de acceso. Si sospechas que otra persona ha accedido a tu cuenta sin autorización, debes comunicarlo cuanto antes.</p>
<h2 className="text-xl font-bold mt-10 mb-4">4. Fase beta</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio se encuentra en fase beta. Durante esta etapa pueden modificarse, añadirse, limitarse, suspenderse o retirarse funciones con el fin de probar y mejorar el servicio.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cuando un cambio afecte de forma relevante a los derechos de los usuarios o al tratamiento de sus contenidos, se informará de manera adecuada cuando resulte legalmente exigible.</p>
<h2 className="text-xl font-bold mt-10 mb-4">5. Tu contenido sigue siendo tuyo</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Conservas los derechos que te correspondan sobre los proyectos, imágenes, vídeos, textos y demás materiales que publiques.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Publicar contenido en Designfolio no transfiere su propiedad a la plataforma.</p>
<h2 className="text-xl font-bold mt-10 mb-4">6. Licencia necesaria para prestar el servicio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Mientras mantengas contenido publicado, concedes a Designfolio una licencia no exclusiva, gratuita y limitada a lo necesario para operar la plataforma, que permite:</p>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">alojar el contenido;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">reproducirlo técnicamente dentro de la infraestructura del servicio;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">generar miniaturas, redimensionar imágenes o adaptar formatos cuando sea técnicamente necesario para mostrarlos;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">mostrarlo a otros usuarios y visitantes según las opciones de visibilidad disponibles;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">permitir que los proveedores técnicos de Designfolio realicen exclusivamente las operaciones necesarias para alojar, transmitir y mostrar el contenido.</li></ul>
<p className="mb-4 leading-relaxed text-[#4f4f57]">El alcance puede ser mundial porque el servicio puede ser consultado desde distintos países. Esta licencia no autoriza a Designfolio a vender tu obra ni a licenciarla a terceros para publicidad ajena a la propia prestación del servicio.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La licencia finaliza cuando el contenido deja de estar publicado o se elimina definitivamente del servicio, salvo copias técnicas temporales, copias de seguridad o conservación necesaria para cumplir obligaciones legales, proteger la seguridad o atender reclamaciones.</p>
<h2 className="text-xl font-bold mt-10 mb-4">7. Responsabilidad sobre lo que publicas</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Eres responsable de los proyectos, imágenes, vídeos, textos, comentarios y demás contenidos que publiques o compartas mediante tu cuenta.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Solo puedes publicar contenido que hayas creado o respecto del cual dispongas de los derechos, licencias, permisos y autorizaciones necesarios.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Esto incluye, cuando corresponda, derechos de autor, marcas, fotografías, vídeos, música, tipografías, recursos gráficos, derechos de imagen, privacidad y permisos de las personas identificables que aparezcan en el contenido.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">No publiques trabajos ajenos atribuyéndotelos como propios. Si un proyecto es colaborativo, debes respetar la autoría de las demás personas participantes y disponer de las autorizaciones necesarias para publicarlo.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La publicación o moderación de un contenido no significa que Designfolio certifique su autoría, originalidad, veracidad o licitud.</p>
<h2 className="text-xl font-bold mt-10 mb-4">8. Contenido público</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Los contenidos publicados con visibilidad pública pueden ser accesibles desde Internet y vistos por personas que no tengan una cuenta en Designfolio.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Antes de publicar, debes valorar si el contenido contiene datos personales, imágenes de terceros, información confidencial o materiales para los que necesites autorización.</p>
<h2 className="text-xl font-bold mt-10 mb-4">9. Moderación</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio puede realizar revisiones manuales o técnicas de contenidos para comprobar el cumplimiento de estas normas.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La moderación puede producirse antes o después de la publicación y no constituye una garantía de autoría, legalidad, calidad, originalidad o exactitud.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cuando corresponda, Designfolio podrá:</p>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">advertir sobre un incumplimiento;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">rechazar un contenido pendiente;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">reducir o limitar su visibilidad;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">archivar o retirar una publicación;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">restringir temporalmente funciones;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">suspender o desactivar una cuenta;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">bloquear el acceso cuando exista riesgo de seguridad, fraude o abuso;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">adoptar medidas necesarias para cumplir una obligación legal o una resolución de una autoridad competente.</li></ul>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cuando resulte aplicable, se informará al usuario afectado de la medida adoptada y de sus motivos, salvo que una obligación legal, una investigación, la seguridad del servicio o la protección de terceros justifique otra actuación.</p>
<h2 className="text-xl font-bold mt-10 mb-4">10. Conductas prohibidas</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">No puedes utilizar Designfolio para:</p>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">publicar contenido ilícito;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">infringir derechos de autor, marcas, derechos de imagen, privacidad u otros derechos de terceros;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">suplantar a otra persona o falsear deliberadamente la autoría de un proyecto;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">acosar, amenazar, discriminar, difamar o realizar ataques personales ilícitos;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">publicar datos personales ajenos sin una base legítima;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">difundir malware, enlaces maliciosos o contenido destinado a comprometer la seguridad;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">intentar acceder sin autorización a cuentas, sistemas o datos;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">eludir medidas de seguridad, controles de acceso o mecanismos de moderación;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">manipular artificialmente me gusta, comentarios, visualizaciones u otras métricas;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">realizar scraping, automatización o extracción masiva que vulnere derechos, eluda medidas técnicas o perjudique el servicio;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">utilizar datos obtenidos de Designfolio para spam, acoso, publicidad no solicitada o finalidades incompatibles con la comunidad.</li></ul>
<h2 className="text-xl font-bold mt-10 mb-4">11. Comentarios e interacciones</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Los comentarios, me gusta y demás interacciones forman parte de la actividad de la comunidad.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cada usuario es responsable de sus comentarios y de las interacciones que realice. No deben utilizarse para acosar, insultar, amenazar, difamar ilícitamente, hacer spam, publicar datos personales ajenos sin autorización o vulnerar derechos de terceros.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Las interacciones podrán retirarse o limitarse cuando vulneren estos Términos o cuando resulte necesario por seguridad o por una obligación legal.</p>
<h2 className="text-xl font-bold mt-10 mb-4">12. Notificación de contenido ilícito o vulneraciones de derechos</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Si consideras que un contenido concreto es ilícito o vulnera tus derechos, puedes notificarlo escribiendo a <strong>jhonnydp78@gmail.com</strong>.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La notificación debe identificar con precisión el contenido afectado, preferiblemente mediante su URL o localización exacta, y explicar de forma suficientemente clara el motivo de la reclamación. Designfolio podrá solicitar información adicional cuando sea necesaria para valorar la notificación.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Las notificaciones se tramitarán de forma diligente. Cuando corresponda conforme a la legislación aplicable, Designfolio podrá retirar o bloquear el acceso al contenido y comunicar al usuario afectado los motivos de la decisión.</p>
<h2 className="text-xl font-bold mt-10 mb-4">13. Cierre de cuenta</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Puedes solicitar el cierre de tu cuenta utilizando la función disponible dentro de la aplicación cuando exista o escribiendo a <strong>jhonnydp78@gmail.com</strong> desde la dirección asociada a tu cuenta.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Al cerrar la cuenta, Designfolio iniciará el proceso de eliminación o desvinculación de los datos y contenidos asociados conforme a la Política de privacidad, sin perjuicio de las copias técnicas temporales y de la información que deba conservarse por obligaciones legales, seguridad o defensa frente a reclamaciones.</p>
<h2 className="text-xl font-bold mt-10 mb-4">14. Suspensión o desactivación por Designfolio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio puede suspender o desactivar una cuenta cuando exista un incumplimiento grave o reiterado de estos Términos, un riesgo de seguridad o fraude, un perjuicio para otros usuarios o para el servicio, una reclamación fundada o una obligación legal.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cuando sea compatible con la seguridad, la investigación de un abuso y la legislación aplicable, se informará al usuario de la medida y de su motivo.</p>
<h2 className="text-xl font-bold mt-10 mb-4">15. Propiedad del servicio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio y sus elementos propios —incluidos software, interfaz, estructura, textos propios y recursos originales— pertenecen a <strong>Jhonny Alberto Duque Pérez</strong> o se utilizan con autorización.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Estos Términos no te conceden derechos de propiedad sobre el servicio ni sobre contenidos de otros usuarios.</p>
<h2 className="text-xl font-bold mt-10 mb-4">16. Disponibilidad del servicio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Al tratarse de una beta, pueden producirse errores, interrupciones o cambios. Se adoptarán medidas razonables para mantener la plataforma disponible y segura, pero no se garantiza que funcione de manera ininterrumpida o libre de errores.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Nada de lo previsto en estos Términos limita los derechos o responsabilidades que legalmente no puedan excluirse.</p>
<h2 className="text-xl font-bold mt-10 mb-4">17. Privacidad y cookies</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">El tratamiento de datos personales se rige por la <strong>Política de privacidad</strong> y el uso de cookies por la <strong>Política de cookies</strong> de Designfolio.</p>
<h2 className="text-xl font-bold mt-10 mb-4">18. Cambios en estos Términos</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Podemos modificar estos Términos para reflejar cambios en el servicio, en la fase beta o en la normativa aplicable.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Cuando un cambio afecte de forma relevante a los derechos u obligaciones de los usuarios, se comunicará de forma adecuada antes de su entrada en vigor cuando la normativa lo exija.</p>
<h2 className="text-xl font-bold mt-10 mb-4">19. Legislación aplicable y jurisdicción</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Estos Términos se rigen por la legislación española y por la normativa de la Unión Europea que resulte aplicable, sin perjuicio de las normas imperativas que puedan corresponder por el país de residencia o por la condición de consumidor del usuario.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Las controversias se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable. Cuando exista un fuero obligatorio, prevalecerá ese fuero.</p>
<h2 className="text-xl font-bold mt-10 mb-4">20. Contacto</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Para cuestiones relacionadas con estos Términos puedes escribir a <strong>jhonnydp78@gmail.com</strong>.<br/></p>
      </div>
      <PublicFooter />
    </main>
  );
}
