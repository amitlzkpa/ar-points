<template>
  <div>
    <v-footer padless absolute>
      <v-row justify="center">
        <v-col class="text-center" cols="12">
          <v-spacer></v-spacer>
          <span> </span>
        </v-col>
      </v-row>
    </v-footer>
  </div>
</template>

<script>
export default {
  filters: {
    year: function (date) {
      return moment(date).format("YYYY");
    },
  },
};
</script>
