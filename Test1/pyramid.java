/**
  * Generates a pyramid out of * characters of n height.
  * Author: Jatinder Bhachu
  */
class Main {
    public static void main(String[] args) {
        int n = 5;

        for(int i = 1; i <= n; i++) {
            String stars = generateStars(i);
            int leftPadding = (n-i) + stars.length();
            System.out.printf("%" + Integer.toString(leftPadding) + "s\n", stars);
        }
    }

    private static String generateStars(int n) {
        StringBuilder builder = new StringBuilder(n*2);

        for(int i = 0; i < n; i++) {
            // don't append a space to last string
            builder.append(i == n-1 ? "*" : "* ");
        }

        return builder.toString();
    }
}
