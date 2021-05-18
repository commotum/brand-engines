export const getItems = (amount: number) =>
  new Array(amount)
    .fill(null)
    .map((_, i) => ({ name: `OpenAI 43${i}`, core: false, history: [] }))

export const getSamples = (amount: number) =>
  new Array(amount).fill(null).map(
    (
      _,
    ) => `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus tincidunt lectus ac dui ullamcorper, vel tempus nisl gravida. Ut rutrum mauris vitae nisi tincidunt tempus. Vivamus ultrices pretium accumsan. Praesent erat ipsum, euismod ut dolor sit amet, euismod fringilla velit. Proin imperdiet efficitur congue. Curabitur a facilisis turpis, at ornare ex. Quisque consectetur et libero sit amet vestibulum.

Sed venenatis ornare venenatis. Nulla aliquet ligula vel dapibus euismod. Duis in facilisis lacus. Mauris sed porta augue. Morbi nec fringilla augue, nec consectetur ligula. Nunc mi nisl, viverra et eleifend eget, consequat et tellus. Aenean in ante justo. Phasellus non porttitor justo, nec porta est. Pellentesque tempor, nisl a molestie ultricies, turpis tellus dictum risus, id vulputate dolor massa a enim. Pellentesque tristique condimentum vestibulum. Praesent rhoncus tortor nisi, volutpat condimentum diam congue et. Ut molestie, dolor in pulvinar accumsan, risus felis vestibulum dui, ac placerat odio lorem et odio. Ut cursus velit in justo tempor, a porttitor ante fermentum.`,
  )

export const getCheckpoints = (amount: number) =>
  new Array(amount).fill(null).map((_, i) => ({
    id: `${i}`,
    title: `Checkpoint ${i}`,
    samples: getSamples(5),
  }))
