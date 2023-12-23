const CardSpotComponent = {
  props: ['cards'],
  template: `
  <spot @click="HandleCardTouch(card)" v-for="(card, index) in cards" v-if="index < 3" :class="{ empty: card.words.length === 0 }">
    <controls>
      <button class="clockwise" @click="RotateCard(event, card, 1)"></button>
      <button class="anticlockwise" @click="RotateCard(event, card, -1)"></button>
    </controls>
    <card :style="{ rotate: card.rotation * 90 + 'deg' }" :class="{ rotating: card.isRotating, selected: card.isSelected }">
      <words>
        <word v-for="word in card.words">{{ word }}</word>
      </words>
    </card>
  </spot>
  `,
  methods: {
    HandleCardTouch(card) {
      this.$emit('handle-card-touch', card);
    },
    RotateCard(event, card, direction) {
      this.$emit('rotate-card', { event: event, card: card, direction: direction });
    },
  },
};
