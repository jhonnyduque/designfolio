import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import Image from "next/image";
import { PublicMenu } from "@/components/layout/PublicMenu";

export const metadata = { title: "Política de cookies - Designfolio" };

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
        <h1 className="text-3xl font-marcellus mb-8">Política de cookies</h1>
<p className="mb-4 leading-relaxed text-[#4f4f57]"><strong>Última actualización:</strong> 18 de septiembre de 2026</p>
<h2 className="text-xl font-bold mt-10 mb-4">1. Qué son las cookies</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Las cookies y tecnologías equivalentes son pequeños archivos o identificadores que un sitio web puede almacenar o consultar en el dispositivo del usuario para permitir funciones técnicas, recordar una sesión o prestar determinadas funcionalidades.</p>
<h2 className="text-xl font-bold mt-10 mb-4">2. Qué utiliza actualmente Designfolio</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio utiliza únicamente tecnologías técnicas o estrictamente necesarias para prestar las funciones solicitadas por el usuario y proteger el funcionamiento básico del servicio.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">No utilizamos cookies de publicidad comportamental, remarketing ni seguimiento comercial entre sitios. Tampoco utilizamos actualmente cookies propias de analítica de marketing.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Entre las tecnologías técnicas que puede utilizar Designfolio se encuentran:</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">| Tipo | Finalidad | Duración orientativa | Responsable |<br/>| --- | --- | --- | --- |<br/>| Sesión y autenticación | Mantener la sesión del usuario identificado y permitir el acceso seguro a su cuenta | Sesión o hasta cierre de sesión, según configuración técnica | Designfolio |<br/>| Estado temporal de registro o invitación | Conservar temporalmente la información necesaria para completar un registro o una redirección de autenticación | Aproximadamente 15 minutos cuando se utilice este flujo | Designfolio |<br/>| Identificador técnico de visitante | Evitar interacciones duplicadas o abusivas, por ejemplo cuando determinadas funciones puedan utilizarse sin una cuenta | Durante el periodo técnicamente necesario para esa finalidad | Designfolio |</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Estas tecnologías no se utilizan para publicidad ni para crear perfiles comerciales de los usuarios.</p>
<h2 className="text-xl font-bold mt-10 mb-4">3. Inicio de sesión con Google</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Si eliges iniciar sesión o registrarte mediante Google, serás redirigido al servicio de Google para autenticarte.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Google puede utilizar sus propias cookies o tecnologías dentro de sus dominios conforme a sus políticas y a la configuración de tu cuenta o navegador. Designfolio no controla las cookies que Google establezca directamente en sus propios dominios.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Designfolio utiliza la información devuelta por el proceso de autenticación únicamente para permitir el acceso o registro solicitado y para las finalidades descritas en la Política de privacidad.</p>
<h2 className="text-xl font-bold mt-10 mb-4">4. Por qué no aparece un banner de consentimiento para las cookies técnicas</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La normativa española sobre cookies distingue las tecnologías sujetas a consentimiento de aquellas que son estrictamente necesarias para realizar una comunicación o prestar un servicio expresamente solicitado por el usuario.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Mientras Designfolio utilice exclusivamente cookies o tecnologías que sean estrictamente necesarias para funciones como autenticación, seguridad, mantenimiento de sesión o integridad técnica del servicio, no se solicitará consentimiento previo mediante un banner por esas tecnologías exceptuadas.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Esto no elimina el deber de transparencia. Por ese motivo esta política explica qué tipos de tecnologías se utilizan y para qué sirven.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Si en el futuro Designfolio incorpora cookies o tecnologías de analítica, publicidad, personalización u otras finalidades que requieran consentimiento, se actualizará esta política y se implantará el mecanismo de consentimiento correspondiente antes de utilizarlas cuando sea legalmente necesario.</p>
<h2 className="text-xl font-bold mt-10 mb-4">5. Cómo consultar, borrar o bloquear cookies</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Puedes consultar y eliminar las cookies almacenadas por Designfolio desde la configuración de tu navegador. También puedes configurar el navegador para bloquear determinadas cookies.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La ruta exacta depende del navegador que utilices y normalmente se encuentra en los apartados de privacidad, seguridad, datos de sitios o cookies.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Bloquear o eliminar cookies estrictamente necesarias puede provocar que:</p>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">se cierre tu sesión;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">no pueda completarse correctamente un registro o inicio de sesión;</li></ul>
<ul className="mb-6 text-[#4f4f57]"><li className="ml-4 list-disc mb-1.5">determinadas funciones de seguridad o prevención de interacciones duplicadas dejen de funcionar correctamente.</li></ul>
<h2 className="text-xl font-bold mt-10 mb-4">6. Cambios en esta política</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Podemos actualizar esta Política de cookies si cambian las tecnologías utilizadas o las obligaciones legales aplicables.</p>
<p className="mb-4 leading-relaxed text-[#4f4f57]">La versión vigente mostrará siempre la fecha de su última actualización.</p>
<h2 className="text-xl font-bold mt-10 mb-4">7. Contacto</h2>
<p className="mb-4 leading-relaxed text-[#4f4f57]">Para consultas relacionadas con cookies o privacidad puedes escribir a <strong>jhonnydp78@gmail.com</strong>.<br/></p>
      </div>
      <PublicFooter />
    </main>
  );
}
