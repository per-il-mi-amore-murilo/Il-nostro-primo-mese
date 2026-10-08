(() => {
  const root = document.querySelector('.creditos');
  if (!root) return;
  const rolo = root.querySelector('.creditos__rolo');
  const intro = root.querySelector('.creditos__intro');
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inclinacao = 0;
  const velocidade = 58;
  const tempoIntro = 3200;

  let fase = 'intro', y = 0, inicio = 0, ultimo = 0, pausado = false, visivel = false;

  const comeco = () => rolo.offsetHeight * 1.02;
  const fimY = () => -rolo.offsetHeight * 1.06;

  function aplicar() {
    const p = Math.min(1, Math.max(0, (comeco() - y) / (comeco() - fimY())));
    rolo.style.opacity = p > 0.93 ? String(Math.max(0, (1 - p) / 0.07)) : '1';
    rolo.style.transform = `translateY(${y}px)`;
  }

  function reiniciar(agora) {
    fase = 'intro';
    y = comeco();
    inicio = agora;
    if (intro) intro.classList.add('on');
    aplicar();
  }

  function passo(agora) {
    requestAnimationFrame(passo);
    if (!visivel) { ultimo = agora; return; }
    const dt = Math.min(0.05, (agora - ultimo) / 1000);
    ultimo = agora;
    if (pausado) { inicio += dt * 1000; return; }
    if (fase === 'intro') {
      if (agora - inicio > tempoIntro) { fase = 'rolar'; if (intro) intro.classList.remove('on'); }
      return;
    }
    y -= velocidade * dt;
    if (y <= fimY()) { reiniciar(agora); return; }
    aplicar();
  }

  new IntersectionObserver(([e]) => {
    const antes = visivel;
    visivel = e.isIntersecting;
    if (visivel && !antes) reiniciar(performance.now());
    if (!visivel && antes) {
      fase = 'intro';
      if (intro) intro.classList.remove('on');
      y = comeco();
      aplicar();
    }
  }, { threshold: 0.6 }).observe(root);

  root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pausado = true; });
  root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') pausado = false; });
  root.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') pausado = !pausado; });
  root.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pausado = !pausado; } });

  y = comeco();
  aplicar();
  requestAnimationFrame(t => { ultimo = t; passo(t); });
})();


(() => {
  const trilho = document.querySelector('.universos');
  if (!trilho) return;
  const cards = [...trilho.querySelectorAll('.universo')];
  const cont = document.querySelector('.multi__cont');
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const comportamento = reduzir ? 'auto' : 'smooth';
  let atual = 0;

  const passo = () => cards[0].offsetWidth + parseFloat(getComputedStyle(trilho).columnGap || 0);
  const ir = i => {
    i = Math.max(0, Math.min(cards.length - 1, i));
    const alvo = cards[i].offsetLeft - (trilho.clientWidth - cards[i].offsetWidth) / 2;
    trilho.scrollTo({ left: alvo, behavior: comportamento });
  };
  const atualizar = () => {
    const centro = trilho.scrollLeft + trilho.clientWidth / 2;
    let melhor = 0, dist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centro);
      if (d < dist) { dist = d; melhor = i; }
    });
    atual = melhor;
    if (cont) cont.textContent = `${atual + 1} / ${cards.length}`;
  };

  trilho.addEventListener('scroll', () => requestAnimationFrame(atualizar), { passive: true });
  document.querySelectorAll('.multi__btn').forEach(b =>
    b.addEventListener('click', () => ir(atual + Number(b.dataset.dir))));
  const sorteio = document.querySelector('.multi__sorteio');
  if (sorteio) sorteio.addEventListener('click', () => {
    let i;
    do { i = Math.floor(Math.random() * cards.length); } while (i === atual && cards.length > 1);
    ir(i);
  });
  trilho.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual - 1); }
  });
  atualizar();
})();
