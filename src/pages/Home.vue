<template>
  <v-container fluid ma-0 pa-0>
    <v-row>
      <v-carousel
        cycle
        height="300"
        hide-delimiter-background
        show-arrows-on-hover
      >
        <v-carousel-item v-for="(slide, i) in slides" :key="i">
          <v-sheet :color="colors[i]" height="100%">
            <v-row class="fill-height" align="center" justify="center">
              <div class="display-3">{{ slide }} Slide</div>
            </v-row>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-row>

    <br />

    <v-container>
      <br />
      <h1 class="display-3">AR Points</h1>
      <br />
      <h4 class="display-1">Explore your awesome app</h4>
      <br />
      <v-row>
        <v-col cols="12" sm="8">
          <p class="headline grey--text text-justify">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident
            similique sapiente iste possimus facilis id praesentium laborum vel
            pariatur sunt voluptatibus nisi voluptas, sit excepturi, eveniet nam
            fugit aspernatur ducimus!
          </p>
        </v-col>

        <v-col cols="12" sm="4">
          <v-btn block color="grey lighten-4" elevation="0" href="/users/login"
            >Get started >></v-btn
          >
        </v-col>
      </v-row>
      <hr />
      <v-row class="pa-4">
        <v-col cols="12" sm="1"> </v-col>
        <v-col cols="12" sm="3">
          <v-img
            lazy-src="../assets/imgs/generic-img-500x500.jpg"
            height="250"
            width="250"
            src="../assets/imgs/generic-img-500x500.jpg"
          ></v-img>
        </v-col>
        <v-col cols="12" sm="7" align-self="center">
          <h4 class="display-1 text-center">
            AR Points is
            <span class="grey--text"> Intuitive </span>
          </h4>
          <br />
          <p class="headline grey--text text-center">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident
            similique sapiente
          </p>
        </v-col>

        <v-col cols="12" sm="1"> </v-col>
      </v-row>
      <hr />
      <v-row class="pa-4">
        <v-col cols="12" sm="1"> </v-col>
        <v-col cols="12" sm="7" align-self="center">
          <h4 class="display-1 text-center">
            AR Points is
            <span class="grey--text"> Awesome </span>
          </h4>
          <br />
          <p class="headline grey--text text-center">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident
            similique sapiente
          </p>
        </v-col>
        <v-col cols="12" sm="3">
          <v-img
            lazy-src="../assets/imgs/generic-img-500x500.jpg"
            height="250"
            width="250"
            src="../assets/imgs/generic-img-500x500.jpg"
          ></v-img>
        </v-col>
        <v-col cols="12" sm="1"> </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      colors: ["grey", "grey", "grey"],
      slides: ["First", "Second", "Third"],
    };
  },
};
</script>

<style scoped>
</style>
